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
import med.goeasy.cmohotel.persistence.repository.SwitchedRoomRepository;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;
import med.goeasy.cmohotel.presentation.dto.prices.PriceEstimationResponse;
import med.goeasy.cmohotel.presentation.dto.prices.RoomPriceDetail;
import med.goeasy.cmohotel.presentation.dto.reservation.*;
import med.goeasy.cmohotel.utils.UtilsService;
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
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
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
    private final InvoiceService invoiceService;
    private final UtilsService utilsService;

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
    public void prolonger(Authentication authentication,Long code, LocalDate date){
        ReservationDetails details = getReservationDetailsByCode(code);
        LocalDateTime oldPlannedEnd = details.getPlannedEnd();

        if ( details.getStatus() != EReservationStatus.CONFIRMED ) {
            throw new OperationNotPermittedException("Impossible de prolonger une réservation non coonfirmée ou cloturée.");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new OperationNotPermittedException(
                    "La nouvelle date de fin doit être postérieure à la date actuelle"
            );
        }


        details.setPlannedEnd(date.atTime(12, 0, 0));
        reservationDetailsRepository.save(details);
        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.UPDATE,
                String.format("Prolongation de la réservation (#%d) de %s à %s.",
                        code,
                        oldPlannedEnd.toLocalDate(),
                        date),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void switchRoom(Authentication authentication, SwitchRoomDto dto) {
        Reservation reservation = getReservationById(dto.reservationId());
        Room oldRoom = reservation.getRoom();
        Room nextRoom = roomService.getRoomById(dto.newRoomId());

        SwitchedRoom history = SwitchedRoom.builder()
                .previousRoom(oldRoom)
                .newRoom(nextRoom)
                .switchTime(LocalDateTime.now())
                .reason(dto.reason())
                .build();

        reservation.setRoom(nextRoom);

        reservation.getSwitchedRooms().add(history);

        reservationRepository.save(reservation);
        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.UPDATE,
                String.format("Changement de la chambre de %s (%s - > %s)",
                        reservation.getPerson().getFullName(),
                        oldRoom.getCode(),
                        nextRoom.getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void removeLastRoomSwitch(Authentication authentication, String reservationId, Long switchedRoomId) {
        // 1. Récupérer la réservation avec ses historiques
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Réservation non trouvée"));

        // 2. Trouver l'entrée spécifique à supprimer
        SwitchedRoom switchToRemove = reservation.getSwitchedRooms().stream()
                .filter(s -> s.getId().equals(switchedRoomId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Historique de switch non trouvé"));

        // 3. Supprimer l'entrée de la liste
        // Grâce à orphanRemoval = true et CascadeType.ALL, elle sera supprimée de la DB
        reservation.getSwitchedRooms().remove(switchToRemove);

        // 4. Mettre à jour la chambre actuelle de la personne
        // On regarde s'il reste d'autres switchs après la suppression
        if (!reservation.getSwitchedRooms().isEmpty()) {
            // Comme la liste est annotée @OrderBy("switchTime DESC"),
            // le premier élément est maintenant le switch précédent
            Room lastRoom = reservation.getSwitchedRooms().get(0).getNewRoom();
            reservation.setRoom(lastRoom);
        } else {
            // S'il n'y a plus aucun switch, on revient à la chambre initiale.
            // NOTE: Si vous ne stockez pas la chambre initiale ailleurs,
            // vous pouvez utiliser 'previousRoom' de l'élément qu'on vient de supprimer.
            reservation.setRoom(switchToRemove.getPreviousRoom());
        }

        // 5. Sauvegarder
        reservationRepository.save(reservation);
        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.DELETE,
                String.format("Suppression du Changement de la chambre de %s (%s - > %s)",
                        reservation.getPerson().getFullName(),
                        switchToRemove.getPreviousRoom().getCode(),
                        switchToRemove.getNewRoom().getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
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
        reservationDetails = reservationDetailsRepository.save(reservationDetails);
        invoiceService.activateInvoice(reservationDetails);
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
        return reservations.stream().map(reservationDetails -> ReservationDetailsResponseDto.mapWithValidatedNightToDto(
                reservationDetails,
                invoiceService.getValidatedNights(reservationDetails)
        )).toList();
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

    public byte[] generateRegistrationCard(Authentication authentication, Long code) throws Exception {
        ReservationDetails details = reservationDetailsRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("Réservation non trouvée"));

        PriceEstimationResponse estimation = calculateEstimationByCode(details);

        Context context = new Context();
        context.setVariable("details", details);
        context.setVariable("estimation", estimation);
        context.setVariable("generatedBy", authentication.getName());
        context.setVariable("now", LocalDateTime.now());
        context.setVariable("logoBase64", "data:image/png;base64," + utilsService.getAppLogoAs64());
        String htmlContent = templateEngine.process("reservation-card", context);
        // Log de l'action (Consultation/Génération de fiche)
        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.SELECT,
                String.format("Génération de la fiche de réservation pour le code #%d.", details.getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        }catch (Exception e) {
            log.error("Erreur lors de la génération du PDF : {}", e.getMessage());
            throw new BadRequestException("Échec de la génération du PDF de la reservation.");
        }
    }

    public void getMainCourante(Authentication authentication, LocalDate day){
        LocalDateTime start = day.atStartOfDay();
        LocalDateTime end = day.atTime(LocalTime.MAX);
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
        // 1. Déterminer la période (Priorité au réel, sinon prévu)
        LocalDateTime start = details.getCheckin() != null ? details.getCheckin() : details.getPlannedStart();
        LocalDateTime end = details.getCheckout() != null ? details.getCheckout() : details.getPlannedEnd();

        // 2. Calculer la durée (Minimum 1 nuit)
        long duration = java.time.temporal.ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate());
        if (duration <= 0) duration = 1;

        // 3. Groupement des réservations par Chambre
        Map<Room, List<Reservation>> roomGroups = details.getReservations().stream()
                .filter(r -> r.getRoom() != null)
                .collect(Collectors.groupingBy(Reservation::getRoom));

        List<RoomPriceDetail> priceDetails = new ArrayList<>();
        double totalGlobal = 0.0;

        for (Map.Entry<Room, List<Reservation>> entry : roomGroups.entrySet()) {
            Room room = entry.getKey();
            List<Reservation> guestsInRoom = entry.getValue();

            // 4. Trouver la personne de référence selon la logique métier (Militaire le plus gradé > Civil)
            Person referencePerson = invoiceService.findReferencePersonForPricing(guestsInRoom);

            // 5. Calculer le prix unitaire selon l'éligibilité (ex: gratuit pour mineurs)
            Double unitPrice = 0.0;
            if (invoiceService.isEligibleForPricing(referencePerson)) {
                // Utilise la catégorie de la personne de référence pour chercher dans les prix de la chambre
                unitPrice = invoiceService.findPriceForRoom(room, referencePerson.getGrade().getCategory());
            }

            double roomTotalPrice = unitPrice * duration;
            totalGlobal += roomTotalPrice;

            priceDetails.add(new RoomPriceDetail(
                    room.getRoomType().getType() + " / " + room.getCode(),
                    unitPrice,
                    roomTotalPrice
            ));
        }

        return new PriceEstimationResponse(priceDetails, totalGlobal, duration);
    }
}
