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
import med.goeasy.cmohotel.persistence.entity.enums.*;
import med.goeasy.cmohotel.persistence.repository.ReservationDetailsRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.persistence.repository.RoomRepository;
import med.goeasy.cmohotel.persistence.repository.ValidatedNightRepository;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.prices.PriceEstimationResponse;
import med.goeasy.cmohotel.presentation.dto.prices.RoomPriceDetail;
import med.goeasy.cmohotel.presentation.dto.reservation.*;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;
import med.goeasy.cmohotel.presentation.dto.room.SwitchedRoomDto;
import med.goeasy.cmohotel.presentation.dto.statistic.OccupationStatsDto;
import med.goeasy.cmohotel.presentation.dto.statistic.RoomTypeStatsDto;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
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
    private final RoomRepository roomRepository;
    private final ValidatedNightRepository validatedNightRepository;

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
                    .appliedPrice(person.appliedPrice())
                    .build();
            reservation = reservationRepository.save(reservation);
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
        if (detailsDb.getStatus() == EReservationStatus.CLOSED || detailsDb.getStatus() == EReservationStatus.CANCELED)
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
                    .appliedPrice(person.appliedPrice())
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

    /**
     * Décale les dates d'un séjour (glisser-déposer horizontal sur le planning des chambres).
     * L'arrivée et le départ sont déplacés ; lorsque le séjour a déjà été enregistré
     * (check-in / check-out renseignés), ces dates sont décalées du même écart afin que
     * le séjour conserve sa durée et reste visible au bon endroit sur le planning.
     */
    @Transactional
    public void shiftDates(Authentication authentication, Long code, LocalDate start, LocalDate end) {
        ReservationDetails details = getReservationDetailsByCode(code);

        if (details.getStatus() != EReservationStatus.PENDING && details.getStatus() != EReservationStatus.CONFIRMED) {
            throw new OperationNotPermittedException("Impossible de déplacer une réservation déjà traitée.");
        }

        if (start == null || end == null || !end.isAfter(start)) {
            throw new BadRequestException("La date de départ doit être postérieure à la date d'arrivée.");
        }

        LocalDateTime newStart = start.atTime(12, 0, 0);
        LocalDateTime newEnd = end.atTime(12, 0, 0);

        // Vérification de la disponibilité des chambres sur la nouvelle période
        Map<Long, Long> requestedCapacityPerRoom = details.getReservations().stream()
                .filter(r -> r.getRoom() != null)
                .collect(Collectors.groupingBy(r -> r.getRoom().getId(), Collectors.counting()));

        requestedCapacityPerRoom.forEach((roomId, countRequested) -> {
            Room room = roomService.getRoomById(roomId);

            if (!room.isAvailable()) {
                throw new BadRequestException("Chambre " + room.getCode() + " hors service.");
            }

            if (!room.isShared()) {
                boolean occupied = reservationRepository.isRoomOccupied(roomId, newStart, newEnd, code);
                if (occupied) {
                    throw new BadRequestException(
                            "La chambre " + room.getName() + " est individuelle et déjà occupée sur cette période.");
                }
            } else {
                long currentOccupants = reservationRepository.countCurrentOccupants(roomId, newStart, newEnd, code);
                if (currentOccupants + countRequested > room.getCapacity()) {
                    throw new BadRequestException(String.format(
                            "Capacité dépassée pour la chambre partagée %s (%d/%d occupés).",
                            room.getName(), currentOccupants + countRequested, room.getCapacity()
                    ));
                }
            }
        });

        LocalDateTime oldPlannedStart = details.getPlannedStart();
        LocalDateTime oldPlannedEnd = details.getPlannedEnd();

        details.setPlannedStart(newStart);
        details.setPlannedEnd(newEnd);

        // Décaler également les dates réelles si le séjour a déjà été enregistré (check-in)
        if (details.getCheckin() != null && oldPlannedStart != null) {
            long deltaDays = ChronoUnit.DAYS.between(oldPlannedStart.toLocalDate(), start);
            details.setCheckin(details.getCheckin().plusDays(deltaDays));
            if (details.getCheckout() != null) {
                details.setCheckout(details.getCheckout().plusDays(deltaDays));
            }
        }

        reservationDetailsRepository.save(details);

        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.UPDATE,
                String.format("Déplacement des dates de la réservation (#%d) du %s au %s vers le %s au %s.",
                        code,
                        oldPlannedStart != null ? oldPlannedStart.toLocalDate() : "-",
                        oldPlannedEnd != null ? oldPlannedEnd.toLocalDate() : "-",
                        start,
                        end),
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
                .reservation(reservation)
                .previousRoom(oldRoom)
                .newRoom(nextRoom)
                .switchTime(LocalDateTime.now())
                .reason(dto.reason())
                .appliedPrice(dto.appliedPrice())
                .previousPrice(reservation.getAppliedPrice())
                .build();

        reservation.setRoom(nextRoom);
        reservation.setAppliedPrice(dto.appliedPrice());

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

        // --- VÉRIFICATION : Empêcher la suppression si au moins une nuit a été validée ---
        boolean hasValidatedNights = validatedNightRepository.existsByInvoiceReservationDetailsCodeAndRoomAppliedId(
                reservation.getDetails().getCode(),
                switchToRemove.getNewRoom().getId()
        );

        if (hasValidatedNights) {
            throw new IllegalStateException(
                    "Impossible de supprimer ce changement de chambre : des nuitées ont déjà été validées pour la chambre "
                            + switchToRemove.getNewRoom().getCode()
            );
        }

        // 3. Supprimer l'entrée de la liste
        reservation.getSwitchedRooms().remove(switchToRemove);

        // 4. Mettre à jour la chambre ET le prix de la réservation
        if (!reservation.getSwitchedRooms().isEmpty()) {
            // En supposant une liste triée par switchTime ASC, le dernier élément resté est le plus récent
            SwitchedRoom lastSwitch = reservation.getSwitchedRooms().get(reservation.getSwitchedRooms().size() - 1);

            reservation.setRoom(lastSwitch.getNewRoom());
            reservation.setAppliedPrice(lastSwitch.getAppliedPrice()); // <-- Réattribution du prix du dernier switch
        } else {
            // S'il n'y a plus aucun switch, on restaure la chambre ET le prix originaux
            reservation.setRoom(switchToRemove.getPreviousRoom());
            reservation.setAppliedPrice(switchToRemove.getPreviousPrice()); // <-- Réattribution du prix initial
        }

        // 5. Sauvegarder
        reservationRepository.save(reservation);

        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.DELETE,
                String.format("Suppression du Changement de la chambre de %s (%s -> %s)",
                        reservation.getPerson().getFullName(),
                        switchToRemove.getPreviousRoom().getCode(),
                        switchToRemove.getNewRoom().getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    public List<SwitchedRoomDto> getSwitchedRoom(Authentication authentication, String reservationId) {
        // 1. Récupérer la réservation avec ses historiques
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Réservation non trouvée"));
        return reservation.getSwitchedRooms().stream().map((r) -> SwitchedRoomDto.builder()
                .id(r.getId())
                .previousRoom(RoomResponseDto.mapToDto(r.getPreviousRoom()))
                .newRoom(RoomResponseDto.mapToDto(r.getNewRoom()))
                .switchTime(r.getSwitchTime())
                .reason(r.getReason())
                .appliedPrice(r.getAppliedPrice())
                .previousPrice(r.getPreviousPrice())
                .build()).toList();
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
    public void closeReservation(Authentication authentication, Long code,LocalDateTime date,
                                 String paymentMode, String priseEnChargeReference) {
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
        // update room cleaning status
        if (reservationDetails.getReservations() != null) {
            reservationDetails.getReservations().forEach(res -> {
                Room room = res.getRoom();
                if (room != null) {
                    // On marque la chambre comme "sale" car le client vient d'entrer
                    room.setClean(false);
                    roomRepository.save(room);
                }
            });
        }

        // Mise à jour du mode de paiement / prise en charge si fourni
        EPaymentMode mode = null;
        if (paymentMode != null && !paymentMode.isBlank()) {
            if (!EnumUtils.isValidEnum(EPaymentMode.class, paymentMode))
                throw new BadRequestException("mode de paiement invalide : " + paymentMode);
            mode = EPaymentMode.valueOf(paymentMode);
            boolean priseEnCharge = mode == EPaymentMode.PRISE_EN_CHARGE;
            if (priseEnCharge && (priseEnChargeReference == null || priseEnChargeReference.isBlank()))
                throw new BadRequestException("La référence de prise en charge est obligatoire.");
            reservationDetails.setPriseEnCharge(priseEnCharge);
            reservationDetails.setPriseEnChargeReference(priseEnCharge ? priseEnChargeReference : null);
        }

        reservationDetails = reservationDetailsRepository.save(reservationDetails);
        invoiceService.activateInvoice(reservationDetails);

        if (mode != null) {
            invoiceService.updatePaymentInfo(reservationDetails, mode, priseEnChargeReference);
        }

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
        if (reservationDetails.getStatus().equals(EReservationStatus.CLOSED))
            throw new BadRequestException("reservation déja cloturée");

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

    public List<ReservationDetailsResponseDto> getDepartPrevu(LocalDateTime start, LocalDateTime end) {
        List<ReservationDetails> reservations = reservationDetailsRepository.getDepartPrevu(start,end);
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

        PriceEstimationResponse estimation = calculatePriceEstimation(details);

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

    public List<ReservationDetailsResponseDto> getMainCourante() {
        List<ReservationDetails> reservations = reservationDetailsRepository.getSejours();
        return reservations.stream().map(reservationDetails -> ReservationDetailsResponseDto.mapWithValidatedNightToDto(
                reservationDetails,
                invoiceService.getValidatedNights(reservationDetails)
        )).toList();
    }

    public List<ReservationDetailsResponseDto> getArchiveMainCourante(LocalDateTime startOfDay,LocalDateTime endOfDay) {
        List<ReservationDetails> reservations = reservationDetailsRepository.getArchiveMainCourante(startOfDay, endOfDay);
        return reservations.stream().map(reservationDetails -> ReservationDetailsResponseDto.mapWithValidatedNightToDto(
                reservationDetails,
                invoiceService.getValidatedNights(reservationDetails)
        )).toList();
    }

    @Transactional(readOnly = true)
    public List<OccupationStatsDto> calculateOccupationStatistics() {
        // 1. Récupérer toutes les chambres pour connaître la capacité totale par pavillon/type
        List<Room> allRooms = roomRepository.getRooms(null,null);

        // 2. Récupérer les séjours actifs
        List<ReservationDetails> activeSejours = reservationDetailsRepository.getSejoursWithDepth();

        // 3. Identifier les chambres réellement occupées et compter les occupants
        // Map<RoomId, ReservationDetails> pour savoir quelle chambre est prise et comment
        Map<Long, ReservationDetails> occupiedRoomsMap = new HashMap<>();
        activeSejours.forEach(details ->
                details.getReservations().stream()
                        .filter(r -> r.getRoom() != null)
                        .forEach(r -> occupiedRoomsMap.put(r.getRoom().getId(), details))
        );

        // 4. Grouper par Pavillon
        Map<Pavillon, List<Room>> roomsByPavillon = allRooms.stream()
                .collect(Collectors.groupingBy(Room:: getPavillon));

        return roomsByPavillon.entrySet().stream().map(entry -> {
            Pavillon pavillon = entry.getKey();
            List<Room> pavillonRooms = entry.getValue();

            // Grouper par Type de chambre au sein du pavillon
            Map<RoomType, List<Room>> roomsByType = pavillonRooms.stream()
                    .collect(Collectors.groupingBy(Room::getRoomType));

            List<RoomTypeStatsDto> typeStats = roomsByType.entrySet().stream().map(typeEntry -> {
                RoomType type = typeEntry.getKey();
                List<Room> roomsOfThisType = typeEntry.getValue();

                long totalRoomsOfType = roomsOfThisType.size();

                // Chambres occupées de ce type
                List<Room> occupiedInType = roomsOfThisType.stream()
                        .filter(room -> occupiedRoomsMap.containsKey(room.getId()))
                        .toList();

                // Calcul des occupants par statut de prise en charge
                long pecCount = 0;
                long directCount = 0;

                for (Room r : occupiedInType) {
                    ReservationDetails rd = occupiedRoomsMap.get(r.getId());
                    // On compte le nombre de personnes dans cette chambre pour ce dossier
                    long occupantsInRoom = rd.getReservations().stream()
                            .filter(res -> res.getRoom().getId().equals(r.getId()))
                            .count();

                    if (rd.isPriseEnCharge()) pecCount += occupantsInRoom;
                    else directCount += occupantsInRoom;
                }

                double rate = totalRoomsOfType > 0 ? (double) occupiedInType.size() / totalRoomsOfType * 100 : 0;

                return new RoomTypeStatsDto(
                        type.getType(),
                        totalRoomsOfType,
                        (long) occupiedInType.size(),
                        pecCount,
                        directCount,
                        rate
                );
            }).toList();

            long totalPavillonRooms = pavillonRooms.size();
            long totalPavillonOccupied = typeStats.stream().mapToLong(RoomTypeStatsDto::occupiedRoomsOfType).sum();
            double globalRate = totalPavillonRooms > 0 ? (double) totalPavillonOccupied / totalPavillonRooms * 100 : 0;

            return new OccupationStatsDto(
                    pavillon.getName(),
                    typeStats,
                    totalPavillonRooms,
                    totalPavillonOccupied,
                    globalRate
            );
        }).toList();
    }

    public byte[] generateMainCourantePdf(Authentication authentication) throws Exception {
        List<ReservationDetails> sejours = reservationDetailsRepository.getSejours();

        List<OccupationStatsDto> occupationStats = calculateOccupationStatistics();

        List<Map<String, Object>> rows = sejours.stream().map(details -> {
            Map<String, Object> rowMap = new HashMap<>();

            // 1. Informations de base
            rowMap.put("pax", details.getReservations().size());
            rowMap.put("paymentCateg", details.isPriseEnCharge() ? "PC" : "ESP");
            rowMap.put("code", details.getCode());
            rowMap.put("checkin", details.getCheckin());
            rowMap.put("category", details.getCategory());

            // 2. Récupération de la facture et des nuits
            Invoice invoice = invoiceService.getInvoiceByReservations(details).orElse(null);
            List<ValidatedNight> nights = (invoice != null) ? invoice.getValidatedNights() : new ArrayList<>();
            rowMap.put("validatedNights", nights);

            // 3. Calcul des nuitées uniques (Logique getUniqueNightsCount)
            long uniqueNights = nights.stream()
                    .map(ValidatedNight::getNightDate)
                    .distinct()
                    .count();
            rowMap.put("uniqueNightsCount", uniqueNights);

            // 4. Calcul du prix total (Logique calculateTotalPrice)
            double total = nights.stream()
                    .mapToDouble(ValidatedNight::getRoomPriceApplied)
                    .sum();
            rowMap.put("totalPrice", total);

            // 5. Regroupement par chambre (Logique getGroupedRooms)
            // On crée une liste de groupes [ {room: Room, occupants: [Reservation]} ]
            Collection<Map<String, Object>> groupedRooms = details.getReservations().stream()
                    .collect(Collectors.groupingBy(
                            res -> res.getRoom().getId(),
                            Collectors.collectingAndThen(Collectors.toList(), list -> {
                                Map<String, Object> groupData = new HashMap<>();
                                groupData.put("room", list.get(0).getRoom());
                                groupData.put("occupants", list);
                                return groupData;
                            })
                    )).values();

            rowMap.put("groupedRooms", groupedRooms);

            return rowMap;
        }).collect(Collectors.toList());

        Context context = new Context();
        context.setVariable("rows", rows);
        context.setVariable("occupationStats", occupationStats);
        context.setVariable("now", LocalDateTime.now());
        context.setVariable("generatedBy", authentication.getName());

        String logoBase64 = utilsService.getAppLogoAs64();
        context.setVariable("logoBase64", "data:image/png;base64," + logoBase64);

        // Assurez-vous que le nom du template correspond (main_courante.html)
        String htmlContent = templateEngine.process("main_courante", context);

        activityLogService.logActivity(
                EAuditActionTarget.RESERVATION,
                EAuditActionOperation.SELECT,
                "Génération du rapport de la main courante.",
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
            log.error("Erreur lors de la génération du PDF de la main courante : {}", e.getMessage());
            throw new BadRequestException("Échec de la génération du PDF de la main courante.");
        }
    }


    public byte[] generateInvoiceProFormat(Authentication authentication, Long reservationCode) throws Exception {
        ReservationDetails details = reservationDetailsRepository.findById(reservationCode)
                .orElseThrow(() -> new EntityNotFoundException("Réservation non trouvée"));

        Map<String, String> roomChainsMap = new HashMap<>();

        if (details != null && details.getReservations() != null) {
            for (Reservation res : details.getReservations()) {
                if (res.getPerson() == null || res.getPerson().getId() == null) {
                    continue;
                }

                String personId = res.getPerson().getId();
                List<SwitchedRoom> switches = res.getSwitchedRooms();

                if (switches != null && !switches.isEmpty()) {
                    List<String> roomNames = new ArrayList<>();

                    // 1. Inverser la liste car 'switchedRooms' dans Reservation est annotée avec @OrderBy("switchTime DESC")
                    List<SwitchedRoom> chronologicalSwitches = new ArrayList<>(switches);
                    Collections.reverse(chronologicalSwitches);

                    // 2. Ajouter la chambre initiale (previousRoom du premier transfert)
                    Room initialRoom = chronologicalSwitches.get(0).getPreviousRoom();
                    if (initialRoom != null) {
                        roomNames.add(initialRoom.getName()); // ou initialRoom.getCode()
                    }

                    // 3. Ajouter chaque nouvelle chambre au fil des transferts
                    for (SwitchedRoom sr : chronologicalSwitches) {
                        if (sr.getNewRoom() != null) {
                            roomNames.add(sr.getNewRoom().getName()); // ou sr.getNewRoom().getCode()
                        }
                    }

                    // Ex: "Chambre 101 -> Chambre 105 -> Chambre 202"
                    roomChainsMap.put(personId, String.join(" > ", roomNames));

                } else if (res.getRoom() != null) {
                    // S'il n'y a eu aucun transfert, conserver le nom de la chambre actuelle
                    roomChainsMap.put(personId, res.getRoom().getName());
                }
            }
        }

        PriceEstimationResponse estimation = calculatePriceEstimation_new(details);

        Context context = new Context();
        context.setVariable("details", details);
        context.setVariable("roomChains", roomChainsMap);
        context.setVariable("estimation", estimation);
        context.setVariable("generatedBy", authentication.getName());
        context.setVariable("now", LocalDateTime.now());
        String logoBase64 = utilsService.getAppLogoAs64();
        context.setVariable("logoBase64", "data:image/png;base64," + logoBase64);

        String htmlContent = templateEngine.process("invoice-pro-format", context);

        // 2. Audit de l'action
        activityLogService.logActivity(
                EAuditActionTarget.INVOICE,
                EAuditActionOperation.SELECT,
                String.format("Génération de la facture pro format de la reservation %s.", reservationCode),
                activityLogService.getClientIp(request),
                authentication.getName()
        );

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            // Support des caractères spéciaux (Optionnel mais recommandé pour le français)
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF : {}", e.getMessage());
            throw new BadRequestException("Échec de la génération du PDF de la facture.");
        }
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


    protected PriceEstimationResponse calculatePriceEstimation_new(ReservationDetails details) {
        // 1. Détermination de la période globale du séjour
        LocalDateTime startDateTime = details.getCheckin() != null ? details.getCheckin() : details.getPlannedStart();
        LocalDateTime endDateTime = details.getCheckout() != null ? details.getCheckout() : details.getPlannedEnd();

        LocalDate globalStart = startDateTime.toLocalDate();
        LocalDate globalEnd = endDateTime.toLocalDate();

        long totalDuration = ChronoUnit.DAYS.between(globalStart, globalEnd);
        if (totalDuration <= 0) totalDuration = 1;

        // Structure : Room -> (Intervalle de dates -> Prix unitaire)
        // Map<Chambre, Map<DateDuJour, PrixUnitaire>>
        Map<Room, Map<LocalDate, Double>> roomDailyPrices = new HashMap<>();

        // 2. Traiter chaque réservation pour remplir la grille tarifaire journalière des chambres
        for (Reservation res : details.getReservations()) {
            List<SwitchedRoom> switches = res.getSwitchedRooms() != null ? res.getSwitchedRooms() : Collections.emptyList();

            List<SwitchedRoom> sortedSwitches = switches.stream()
                    .filter(sr -> sr.getSwitchTime() != null)
                    .sorted(Comparator.comparing(SwitchedRoom::getSwitchTime))
                    .collect(Collectors.toList());

            if (sortedSwitches.isEmpty()) {
                // --- CAS SANS TRANSFERT ---
                Room currentRoom = res.getRoom();
                if (currentRoom != null) {
                    Double price = res.getAppliedPrice() != null ? res.getAppliedPrice() : 0.0;
                    assignDailyPrices(roomDailyPrices, currentRoom, globalStart, globalEnd, price);
                }
            } else {
                // --- CAS AVEC TRANSFERTS ---
                LocalDate currentSegmentStart = globalStart;

                for (SwitchedRoom sr : sortedSwitches) {
                    LocalDate switchDate = sr.getSwitchTime().toLocalDate();

                    if (switchDate.isAfter(currentSegmentStart) && !switchDate.isAfter(globalEnd)) {
                        Room prevRoom = sr.getPreviousRoom();
                        Double prevPrice = sr.getPreviousPrice() != null ? sr.getPreviousPrice() : 0.0;

                        assignDailyPrices(roomDailyPrices, prevRoom, currentSegmentStart, switchDate, prevPrice);
                        currentSegmentStart = switchDate;
                    }
                }

                // Segment final
                if (currentSegmentStart.isBefore(globalEnd)) {
                    SwitchedRoom lastSwitch = sortedSwitches.get(sortedSwitches.size() - 1);
                    Room finalRoom = lastSwitch.getNewRoom() != null ? lastSwitch.getNewRoom() : res.getRoom();
                    Double finalPrice = lastSwitch.getAppliedPrice() != null ? lastSwitch.getAppliedPrice() : res.getAppliedPrice();

                    assignDailyPrices(roomDailyPrices, finalRoom, currentSegmentStart, globalEnd, finalPrice != null ? finalPrice : 0.0);
                }
            }
        }

        // 3. Agrégation : Regrouper par Chambre et par Prix Unitaire pour obtenir le vrai nombre de nuits
        List<RoomPriceDetail> priceDetails = new ArrayList<>();
        double totalGlobal = 0.0;

        for (Map.Entry<Room, Map<LocalDate, Double>> roomEntry : roomDailyPrices.entrySet()) {
            Room room = roomEntry.getKey();
            if (room == null) continue;

            Map<LocalDate, Double> dailyPrices = roomEntry.getValue();

            // Compter combien de jours uniques sont facturés pour chaque tarif
            Map<Double, Long> priceToNightsCount = dailyPrices.values().stream()
                    .collect(Collectors.groupingBy(p -> p, Collectors.counting()));

            for (Map.Entry<Double, Long> priceEntry : priceToNightsCount.entrySet()) {
                Double unitPrice = priceEntry.getKey();
                Long nights = priceEntry.getValue(); // Le nombre réel de nuits uniques pour cette chambre

                double roomTotalPrice = unitPrice * nights;
                totalGlobal += roomTotalPrice;

                String roomTypeStr = room.getRoomType() != null ? room.getRoomType().getType() : "";
                String roomLabel = roomTypeStr.isEmpty() ? room.getName() : roomTypeStr + " / " + room.getName();

                priceDetails.add(new RoomPriceDetail(
                        roomLabel,
                        unitPrice,
                        roomTotalPrice,
                        nights
                ));
            }
        }

        return new PriceEstimationResponse(priceDetails, totalGlobal, totalDuration);
    }

    /**
     * Assigne le tarif jour par jour pour une chambre donnée.
     * Si plusieurs personnes occupent la chambre le même jour, le tarif du jour est conservé une seule fois (pas de double comptage).
     */
    private void assignDailyPrices(Map<Room, Map<LocalDate, Double>> roomDailyPrices, Room room, LocalDate start, LocalDate end, Double price) {
        if (room == null || start == null || end == null || !start.isBefore(end)) return;

        Map<LocalDate, Double> dailyMap = roomDailyPrices.computeIfAbsent(room, k -> new HashMap<>());

        LocalDate current = start;
        while (current.isBefore(end)) {
            // En cas de conflit de prix entre occupants, on conserve le prix non nul ou le plus élevé
            dailyMap.merge(current, price, (oldPrice, newPrice) -> newPrice > 0 ? newPrice : oldPrice);
            current = current.plusDays(1);
        }
    }

    /**
     * Accumule les nuits passées dans une chambre
     */
    private void accumulateRoomNights(Map<Room, Map<Double, Long>> summary, Room room, Double price, long nights) {
        if (room == null || nights <= 0) return;
        summary.computeIfAbsent(room, k -> new HashMap<>())
                .merge(price, nights, Long::sum);
    }

    protected PriceEstimationResponse calculatePriceEstimation(ReservationDetails details) {
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

            // 4. Récupérer le prix appliqué (AppliedPrice)
            // Comme le prix est le même pour toutes les personnes d'une même chambre,
            // on prend celui de la première personne trouvée ou du "PRINCIPAL".
            Double unitPrice = guestsInRoom.stream()
                    .map(Reservation::getAppliedPrice)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(0.0); // Sécurité si aucun prix n'a été saisi

            double roomTotalPrice = unitPrice * duration;
            totalGlobal += roomTotalPrice;

            priceDetails.add(new RoomPriceDetail(
                    room.getRoomType().getType() + " / " + room.getName(),
                    unitPrice,
                    roomTotalPrice,
                    0
            ));
        }

        return new PriceEstimationResponse(priceDetails, totalGlobal, duration);
    }



//    protected PriceEstimationResponse calculateEstimationByCode(ReservationDetails details) {
//        // 1. Déterminer la période (Priorité au réel, sinon prévu)
//        LocalDateTime start = details.getCheckin() != null ? details.getCheckin() : details.getPlannedStart();
//        LocalDateTime end = details.getCheckout() != null ? details.getCheckout() : details.getPlannedEnd();
//
//        // 2. Calculer la durée (Minimum 1 nuit)
//        long duration = java.time.temporal.ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate());
//        if (duration <= 0) duration = 1;
//
//        // 3. Groupement des réservations par Chambre
//        Map<Room, List<Reservation>> roomGroups = details.getReservations().stream()
//                .filter(r -> r.getRoom() != null)
//                .collect(Collectors.groupingBy(Reservation::getRoom));
//
//        List<RoomPriceDetail> priceDetails = new ArrayList<>();
//        double totalGlobal = 0.0;
//
//        for (Map.Entry<Room, List<Reservation>> entry : roomGroups.entrySet()) {
//            Room room = entry.getKey();
//            List<Reservation> guestsInRoom = entry.getValue();
//
//            // 4. Trouver la personne de référence selon la logique métier (Militaire le plus gradé > Civil)
//            Person referencePerson = invoiceService.findReferencePersonForPricing(guestsInRoom);
//
//            // 5. Calculer le prix unitaire selon l'éligibilité (ex: gratuit pour mineurs)
//            Double unitPrice = 0.0;
//            if (invoiceService.isEligibleForPricing(referencePerson)) {
//                // Utilise la catégorie de la personne de référence pour chercher dans les prix de la chambre
//                unitPrice = invoiceService.findPriceForRoom(room, referencePerson.getGrade().getCategory());
//            }
//
//            double roomTotalPrice = unitPrice * duration;
//            totalGlobal += roomTotalPrice;
//
//            priceDetails.add(new RoomPriceDetail(
//                    room.getRoomType().getType() + " / " + room.getCode(),
//                    unitPrice,
//                    roomTotalPrice
//            ));
//        }
//
//        return new PriceEstimationResponse(priceDetails, totalGlobal, duration);
//    }
}
