package med.goeasy.cmohotel.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.exception.OperationNotPermittedException;
import med.goeasy.cmohotel.persistence.entity.*;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EGuestRole;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.persistence.repository.ReservationDetailsRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;
import med.goeasy.cmohotel.presentation.dto.prices.PriceEstimationResponse;
import med.goeasy.cmohotel.presentation.dto.prices.RoomPriceDetail;
import med.goeasy.cmohotel.presentation.dto.reservation.*;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Slf4j
@RequiredArgsConstructor
@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationDetailsRepository reservationDetailsRepository;
    private final PersonService personService;
    private final RoomService roomService;
    private final TemplateEngine templateEngine;
    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;

    @Transactional
    public void create(Authentication authentication, ReservationRequestDto dto) {

        if (!EnumUtils.isValidEnum(EReservationCategory.class, dto.category())) {
            throw new BadRequestException("catégorie invalide : " + dto.category());
        }

        if (dto.persons() == null || dto.persons().isEmpty())
            throw new BadRequestException("Aucun client ajouté");

        LocalDateTime start = dto.startDate().atTime(12, 0, 0);
        LocalDateTime end = dto.endDate().atTime(12, 0, 0);

        //Grouper les personnes par chambre pour vérifier la charge totale demandée
        Map<Long, Long> requestedCapacityPerRoom = dto.persons().stream()
                .collect(Collectors.groupingBy(ReservationPersonsRequestDto::roomId, Collectors.counting()));
        // Vérification de la disponibilité pour chaque chambre unique
        requestedCapacityPerRoom.forEach((roomId, countRequested) -> {
            Room room = roomService.getRoomById(roomId);

            if (!room.isAvailable()) {
                throw new BadRequestException("Chambre " + room.getCode() + " hors service.");
            }

            if (!room.isShared()) {
                // CAS : NON PARTAGÉE
                // On vérifie simplement si la chambre est déjà prise
                boolean occupied = reservationRepository.isRoomOccupied(roomId, start, end,null);

                if (occupied) {
                    throw new BadRequestException("La chambre " + room.getName() + " est individuelle et déjà occupée.");
                }

            } else {
                // CAS : PARTAGÉE
                long currentOccupants = reservationRepository.countCurrentOccupants(roomId, start, end,null);

                if (currentOccupants + countRequested > room.getCapacity()) {
                    throw new BadRequestException(String.format(
                            "Capacité dépassée pour la chambre partagée %s (%d/%d occupés).",
                            room.getName(), currentOccupants, room.getCapacity()
                    ));
                }
            }
        });

        EReservationCategory category = EReservationCategory.valueOf(dto.category());
        ReservationDetails details = ReservationDetails.builder()
                .plannedStart(start)
                .plannedEnd(end)
                .category(category)
                .status(EReservationStatus.PENDING)
                .observation(dto.observation())
                .priseEnCharge(dto.priseEnCharge() != null && dto.priseEnCharge())
                .priseEnChargeReference(dto.priseEnChargeReference())
                .build();
        details = reservationDetailsRepository.save(details);
        for(ReservationPersonsRequestDto person : dto.persons()){
            if (!EnumUtils.isValidEnum(EGuestRole.class, person.role())) {
                throw new BadRequestException("role invalide : " + person.role());
            }
            EGuestRole role = EGuestRole.valueOf(person.role());
            Person p = personService.getPersonById(person.personId());
            Room room = roomService.getRoomById(person.roomId());
            Reservation reservation = Reservation.builder()
                    .details(details)
                    .person(p)
                    .role(role)
                    .room(room)
                    .build();
            reservationRepository.save(reservation);
        }

        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.CREATE,
                String.format("Nouvelle réservation enregistrée (#%d) pour %d personne(s) du %s au %s (Catégorie: %s).",
                        details.getCode(),
                        dto.persons().size(),
                        dto.startDate(),
                        dto.endDate(),
                        details.getCategory()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void update(Authentication authentication, ReservationRequestDto dto, Long code) {
        ReservationDetails detailsDb = getReservationDetailsByCode(code);
        if (detailsDb.getStatus() != EReservationStatus.PENDING)
            throw new OperationNotPermittedException("Vous ne pouvez pas modifier une réservation déja traitée");

        if (!EnumUtils.isValidEnum(EReservationCategory.class, dto.category())) {
            throw new BadRequestException("catégorie invalide : " + dto.category());
        }

        if (dto.persons() == null || dto.persons().isEmpty())
            throw new BadRequestException("Aucun client ajouté");

        LocalDateTime start = dto.startDate().atTime(12, 0, 0);
        LocalDateTime end = dto.endDate().atTime(12, 0, 0);

        //Grouper les personnes par chambre pour vérifier la charge totale demandée
        Map<Long, Long> requestedCapacityPerRoom = dto.persons().stream()
                .collect(Collectors.groupingBy(ReservationPersonsRequestDto::roomId, Collectors.counting()));
        // Vérification de la disponibilité pour chaque chambre unique
        requestedCapacityPerRoom.forEach((roomId, countRequested) -> {
            Room room = roomService.getRoomById(roomId);

            if (!room.isAvailable()) {
                throw new BadRequestException("Chambre " + room.getCode() + " hors service.");
            }

            if (!room.isShared()) {
                // CAS : NON PARTAGÉE
                // On vérifie simplement si la chambre est déjà prise
                boolean occupied = reservationRepository.isRoomOccupied(roomId, start, end,code);

                if (occupied) {
                    throw new BadRequestException("La chambre " + room.getName() + " est individuelle et déjà occupée.");
                }

            } else {
                // CAS : PARTAGÉE
                long currentOccupants = reservationRepository.countCurrentOccupants(roomId, start, end,code);

                if (currentOccupants + countRequested > room.getCapacity()) {
                    throw new BadRequestException(String.format(
                            "Capacité dépassée pour la chambre partagée %s (%d/%d occupés).",
                            room.getName(), currentOccupants, room.getCapacity()
                    ));
                }
            }
        });

        reservationRepository.deleteAll(detailsDb.getReservations());
        detailsDb.getReservations().clear();
        detailsDb.setPlannedStart(start);
        detailsDb.setPlannedEnd(end);
        detailsDb.setCategory(EReservationCategory.valueOf(dto.category()));
        detailsDb.setObservation(dto.observation());
        detailsDb.setPriseEnCharge(dto.priseEnCharge() != null && dto.priseEnCharge());
        detailsDb.setPriseEnChargeReference(dto.priseEnChargeReference());
        detailsDb.setStatus(EReservationStatus.PENDING);

        detailsDb = reservationDetailsRepository.save(detailsDb);
        for(ReservationPersonsRequestDto person : dto.persons()){
            if (!EnumUtils.isValidEnum(EGuestRole.class, person.role())) {
                throw new BadRequestException("role invalide : " + person.role());
            }
            EGuestRole role = EGuestRole.valueOf(person.role());
            Person p = personService.getPersonById(person.personId());
            Room room = roomService.getRoomById(person.roomId());
            Reservation reservation = Reservation.builder()
                    .details(detailsDb)
                    .person(p)
                    .role(role)
                    .room(room)
                    .build();
            reservationRepository.save(reservation);
        }

        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.CREATE,
                String.format("Modification de la réservation (#%d) pour %d personne(s) du %s au %s (Catégorie: %s).",
                        detailsDb.getCode(),
                        dto.persons().size(),
                        dto.startDate(),
                        dto.endDate(),
                        detailsDb.getCategory()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void switchRoom(String reservationId, Long newRoomId, String reason,LocalDateTime switchTime) {
        Reservation reservation = getReservationById(reservationId);
        Room oldRoom = reservation.getRoom();
        Room nextRoom = roomService.getRoomById(newRoomId);

        SwitchedRoom history = SwitchedRoom.builder()
                .previousRoom(oldRoom)
                .newRoom(nextRoom)
                .switchTime(switchTime)
                .reason(reason)
                .build();

        reservation.setRoom(nextRoom);

        reservation.getSwitchedRooms().add(history);

        reservationRepository.save(reservation);

    }

    @Transactional
    public void removeSwitchRoom(String reservationId, Long newRoomId, String reason,LocalDateTime switchTime) {

    }


    @Transactional
    public void acceptReservation(Authentication authentication, Long code,LocalDateTime date) {
        ReservationDetails reservationDetails = getReservationDetailsByCode(code);
        if (reservationDetails.getStatus().equals(EReservationStatus.CONFIRMED))
            throw new BadRequestException("reservation déja confirmée");

        if (reservationDetails.getStatus().equals(EReservationStatus.CLOSED))
            throw new BadRequestException("reservation déja facturée");

        if (reservationDetails.getStatus().equals(EReservationStatus.CANCELED))
            throw new BadRequestException("reservation déja annulée");

        // Change status
        reservationDetails.setStatus(EReservationStatus.CONFIRMED);
        reservationDetails.setCheckin(date);
        reservationDetailsRepository.save(reservationDetails);
        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.UPDATE,
                String.format("Check-in effectué : Le client s'est présenté à l'hôtel le %s. La réservation (#%d) est désormais confirmée.",
                        date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), reservationDetails.getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void closeReservation(Authentication authentication, Long code,LocalDateTime date) {
        ReservationDetails reservationDetails = getReservationDetailsByCode(code);
        if (reservationDetails.getStatus().equals(EReservationStatus.CLOSED))
            throw new BadRequestException("reservation déja clôturée");

       if (!reservationDetails.getStatus().equals(EReservationStatus.CONFIRMED))
            throw new BadRequestException("reservation doit etre confirmée pour proceder à la cloture");

        if (date.isBefore(reservationDetails.getCheckin())) {
            throw new BadRequestException(String.format(
                    "La date de départ (%s) ne peut pas être antérieure à la date d'arrivée (%s).",
                    date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                    reservationDetails.getCheckin().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            ));
        }
        // Change status
        reservationDetails.setStatus(EReservationStatus.CLOSED);
        reservationDetails.setCheckout(date);
        reservationDetailsRepository.save(reservationDetails);
        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.UPDATE,
                String.format("Check-out effectué le %s, pour la reservation (#%d).",
                        date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                        reservationDetails.getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void cancelReservation(Authentication authentication, Long code) {
        ReservationDetails reservationDetails = getReservationDetailsByCode(code);
        if (reservationDetails.getStatus().equals(EReservationStatus.CONFIRMED) || reservationDetails.getStatus().equals(EReservationStatus.CLOSED))
            throw new BadRequestException("reservation déja traitée");

        if (reservationDetails.getStatus().equals(EReservationStatus.CANCELED))
            throw new BadRequestException("reservation déja annulée");
        // Change status
        reservationDetails.setStatus(EReservationStatus.CANCELED);
        reservationDetailsRepository.save(reservationDetails);
        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.UPDATE,
                String.format("Réservation (#%d) annulée.", reservationDetails.getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void deleteReservation(Authentication authentication, Long code) {
        ReservationDetails reservationDetails = getReservationDetailsByCode(code);
        if (!reservationDetails.getStatus().equals(EReservationStatus.PENDING))
            throw new BadRequestException("Vous ne pouvez pas supprimer une reservation déja traitée");

        List<Reservation> reservations = reservationDetails.getReservations();
        reservationRepository.deleteAll(reservations);
        reservationDetailsRepository.delete(reservationDetails);
        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.UPDATE,
                String.format("Suppression définitive de la réservation #%d.", reservationDetails.getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }


    public PageDto<ReservationDetailsResponseDto> search(
            Authentication authentication,
            String key,
            Long reservationCode,
            List<EReservationCategory> categories,
            List<EReservationStatus> status,
            LocalDate start,
            LocalDate end,
            Integer page, Integer size) {
        boolean isRange = start != null;
        Page<ReservationDetails> reservations = reservationDetailsRepository.search(
                key,
                reservationCode,
                status.isEmpty()? null:status,
                categories.isEmpty()? null:categories,
                start != null ? start.atStartOfDay() : null,
                start != null ? end.atTime(23, 59, 59) : null,
                isRange,
                PageRequest.of(page, size)
        );

        List<ReservationDetailsResponseDto> list = reservations.stream().map(ReservationDetailsResponseDto::mapToDto).toList();
        log.info("{} get reservations", authentication.getName());
        return PageDto.of(
                list,
                reservations.getTotalElements(),
                reservations.getTotalPages()
        );
    }

    public List<ReservationDetailsResponseDto> getSejours() {
        List<ReservationDetails> reservations = reservationDetailsRepository.getSejours();
        return reservations.stream().map(ReservationDetailsResponseDto::mapToDto).toList();
        //log.info("{} get reservations", authentication.getName());
    }

    public List<ReservationCalenderResponseDto> getReservationForCalender(Authentication authentication,LocalDate start,LocalDate end){
        List<ReservationDetails> rangeReservations = reservationDetailsRepository.getRangeReservations(
                List.of(EReservationStatus.PENDING, EReservationStatus.CONFIRMED),
                start != null ? start.atStartOfDay() : null,
                start != null ? end.atTime(23, 59, 59) : null
                );
        return rangeReservations.stream().map(ReservationCalenderResponseDto::mapToDto).toList();
    }

    public ReservationDetailsResponseDto getReservationByCode(Authentication authentication, Long code) {
        return ReservationDetailsResponseDto.mapToDto(
                getReservationDetailsByCode(code)
        );
    }

    public List<ReservedRoomResponseDto> getUpcomingReservations(Authentication authentication) {
        LocalDateTime today = LocalDateTime.now().with(LocalTime.MIN);
        return reservationRepository.findFutureReservedRooms(today);
    }

    public List<ReservationResponseDto> getResidentReservations(Authentication authentication) {
        log.info("{} get resident reservations", authentication.getName());
        return reservationRepository.findResidentReservations().stream().map(ReservationResponseDto::mapToDto).toList();
    }

    public byte[] generateInvoice(Authentication authentication, Long code) throws Exception {
        ReservationDetails details = reservationDetailsRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("Réservation non trouvée pour le code: " + code));
        if (details.getStatus() != EReservationStatus.CLOSED)
            throw new BadRequestException("La reservation doit être cloturée pour générer la facture");

        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.SELECT,
                String.format("Génération de la facture pour la réservation #%d.", details.getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
        return generateReservationInvoice(details);
    }


    // TO CHECK
    public ReservationResponseDto getActiveReservationByPerson(String personId){

        return reservationRepository
                .findActiveReservationByPersonId(personId)
                .stream().findFirst()
                .map(ReservationResponseDto::mapToDto)
                .orElse(null);
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected ReservationDetails getReservationDetailsByCode(Long code){
        return reservationDetailsRepository.findById(code)
                .orElseThrow(()-> new BadRequestException("code de reservation n'existe pas"));
    }

    protected Reservation getReservationById(String id){
        return reservationRepository.findById(id)
                .orElseThrow(()-> new BadRequestException("reservation n'existe pas"));
    }
    protected PriceEstimationResponse calculateEstimationByCode(ReservationDetails details) {

        LocalDateTime start = details.getCheckin() != null ? details.getCheckin() : details.getPlannedStart();
        LocalDateTime end = details.getCheckout() != null ? details.getCheckout() : details.getPlannedEnd();

        long duration = java.time.temporal.ChronoUnit.DAYS.between(start, end);
        if (duration <= 0) duration = 1;

        // 3. Groupement des réservations par Chambre
        Map<Room, List<Reservation>> roomGroups = details.getReservations().stream()
                .filter(r -> r.getRoom() != null)
                .collect(Collectors.groupingBy(Reservation::getRoom));

        List<RoomPriceDetail> priceDetails = new ArrayList<>();
        double totalGlobal = 0.0;

        for (Map.Entry<Room, List<Reservation>> entry : roomGroups.entrySet()) {
            Room room = entry.getKey();
            List<Reservation> guests = entry.getValue();

            // 4. Trouver le "Payer" (Grade avec le rating le plus bas)
            Reservation payer = guests.stream()
                    .min(Comparator.comparingInt(r -> r.getPerson().getGrade().getRating()))
                    .orElseThrow();

            EGradeCategory categoryToCharge = payer.getPerson().getGrade().getCategory();

            // 5. Trouver le prix correspondant dans le RoomType
            double unitPrice = room.getRoomType().getPrices().stream()
                    .filter(rp -> rp.getCategory().equals(categoryToCharge))
                    .map(RoomPrice::getPrice)
                    .findFirst()
                    .orElse(0.0);

            double roomTotalPrice = unitPrice * duration;
            totalGlobal += roomTotalPrice;

            priceDetails.add(new RoomPriceDetail(
                    room.getRoomType().getType() + " / " + room.getName(),
                    unitPrice,
                    roomTotalPrice
            ));
        }

        return new PriceEstimationResponse(priceDetails, totalGlobal, duration);
    }

    protected byte[] generateReservationInvoice(ReservationDetails details) throws Exception {

        PriceEstimationResponse estimation = calculateEstimationByCode(details);

        // 2. Préparer le contexte Thymeleaf
        Context context = new Context();
        context.setVariable("details", details);
        context.setVariable("estimation", estimation);

        // 3. Rendre le HTML en String
        String htmlContent = templateEngine.process("reservation-invoice", context);

        // 4. Convertir HTML en PDF
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        }
    }
}
