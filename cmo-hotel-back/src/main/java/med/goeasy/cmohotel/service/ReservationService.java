package med.goeasy.cmohotel.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.*;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EGuestRole;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.persistence.repository.ReservationDetailsRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.presentation.dto.PageDto;
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

    @Transactional
    public void create(Authentication authentication, ReservationRequestDto dto) {

        if (!EnumUtils.isValidEnum(EReservationCategory.class, dto.category())) {
            throw new BadRequestException("categorie invalide : " + dto.category());
        }

        if (dto.persons() == null || dto.persons().isEmpty())
            throw new BadRequestException("Aucun client ajouté");

        EReservationCategory category = EReservationCategory.valueOf(dto.category());
        ReservationDetails details = ReservationDetails.builder()
                .plannedStart(dto.startDate().atStartOfDay())
                .plannedEnd(dto.endDate().atTime(23, 59, 59))
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
                    //.status(EReservationStatus.PENDING)
                    .build();
            reservationRepository.save(reservation);
        }

        log.info("{} create reservation num {} for people {}", authentication.getName(),details.getCode(), dto.persons());
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
        log.info("{} accept reservation num {} ", authentication.getName(),code);
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
        log.info("{} cancel reservation num {} ", authentication.getName(),code);
    }

    @Transactional
    public void deleteReservation(Authentication authentication, Long code) {
        ReservationDetails reservationDetails = getReservationDetailsByCode(code);
        if (!reservationDetails.getStatus().equals(EReservationStatus.PENDING))
            throw new BadRequestException("Vous ne pouvez pas supprimer une reservation déja traitée");

        List<Reservation> reservations = reservationDetails.getReservations();
        reservationRepository.deleteAll(reservations);
        reservationDetailsRepository.delete(reservationDetails);
        log.info("{} delete reservation num {} ", authentication.getName(),code);
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

    public List<ReservationCalenderResponseDto> getReservationForCalender(Authentication authentication,LocalDate start,LocalDate end){
        List<ReservationDetails> rangeReservations = reservationDetailsRepository.getRangeReservations(
                List.of(EReservationStatus.PENDING, EReservationStatus.CLOSED, EReservationStatus.CONFIRMED),
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

    public byte[] generateInvoice(Long code) throws Exception {
        ReservationDetails details = reservationDetailsRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("Réservation non trouvée pour le code: " + code));
        if (details.getStatus() != EReservationStatus.CLOSED)
            throw new BadRequestException("La reservation doit être cloturée pour générer la facture");

        //PriceEstimationResponse priceEstimationResponse = calculateEstimationByCode(details);

        return generateReservationInvoice(details);
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected ReservationDetails getReservationDetailsByCode(Long code){
        return reservationDetailsRepository.findById(code)
                .orElseThrow(()-> new BadRequestException("code de reservation n'existe pas"));
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
