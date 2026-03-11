package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.*;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EPrestationType;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.repository.MealTypeRepository;
import med.goeasy.cmohotel.persistence.repository.PersonRepository;
import med.goeasy.cmohotel.persistence.repository.PrestationRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.presentation.dto.prestation.PrestationPersonRequestDto;
import med.goeasy.cmohotel.presentation.dto.prestation.PrestationRequestDto;
import med.goeasy.cmohotel.presentation.dto.prestation.PrestationResponseDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationResponseDto;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class PrestationService {

    private final PrestationRepository prestationRepo;
    private final MealTypeRepository mealTypeRepository;
    private final MealService mealService;
    private final HttpServletRequest request;
    private final ActivityLogService activityLogService;
    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;

    @Transactional
    public void createPrestation(Authentication authentication, PrestationRequestDto dto) {
        MealType meal = mealService.getMealTypeById(dto.mealId());
        dto.reservations().forEach((r,q)->{
            Reservation reservation = reservationService.getReservationById(r);
            Prestation prestation = Prestation.builder()
                    .reservation(reservation)
                    .name(meal.getName())
                    .type(EPrestationType.MEAL)
                    .quantity((q == null || q == 0)?1:q)
                    .price(BigDecimal.ZERO)
                    .observation(dto.observation())
                    .day(LocalDate.now())
                    .build();
            //prestation = prestationRepo.save(prestation);
            prestation.setPrice(calculateMealPrice(prestation));
            prestationRepo.save(prestation);
            activityLogService.logActivity(
                    EAuditActionTarget.PRESTATION,
                    EAuditActionOperation.CREATE,
                    String.format("Nouvelle préstation enregistrée (%s) pour le %s (Catégorie: %s).",
                            meal.getName(),
                            reservation.getPerson().getFullName(),
                            reservation.getPerson().getGrade().getCategory().getName()
                    ),
                    activityLogService.getClientIp(request),
                    authentication.getName()
            );
        });
    }

    public void createPersonPrestation(Authentication authentication, PrestationPersonRequestDto dto) {
        if (!EnumUtils.isValidEnum(EPrestationType.class, dto.type())) {
            throw new BadRequestException("Type de prestation invalide : " + dto.type());
        }
        Reservation reservation = reservationService.getReservationById(dto.reservation());
        Prestation prestation;
        Integer qty = (dto.quantity() == null || dto.quantity() == 0) ? 1 : dto.quantity();
        if (EPrestationType.MEAL.name().equals(dto.type())){
            //MealType meal = mealService.getMealTypeById(Long.valueOf(dto.name()));
            prestation = Prestation.builder()
                    .reservation(reservation)
                    .name(dto.name())
                    .type(EPrestationType.MEAL)
                    .quantity(qty)
                    .price(BigDecimal.ZERO)
                    .observation(dto.observation())
                    .day(LocalDate.now())
                    .build();
            BigDecimal unitPrice = calculateMealPrice(prestation);
            prestation.setPrice(unitPrice);
        } else {
            prestation = Prestation.builder()
                    .reservation(reservation)
                    .name(dto.name())
                    .type(EPrestationType.SERVICE)
                    .quantity(qty)
                    .price(BigDecimal.valueOf(dto.price()))
                    .observation(dto.observation())
                    .day(LocalDate.now())
                    .build();
        }

        prestationRepo.save(prestation);
        activityLogService.logActivity(
                EAuditActionTarget.PRESTATION,
                EAuditActionOperation.CREATE,
                String.format("Nouvelle préstation enregistrée (%s) pour le %s (Catégorie: %s).",
                        dto.name(),
                        reservation.getPerson().getFullName(),
                        reservation.getPerson().getGrade().getCategory().getName()
                ),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    public void updatePrestation(Authentication authentication, PrestationPersonRequestDto dto, String id) {
        Prestation prestation = getPrestationById(id);

        Integer qty = (dto.quantity() == null || dto.quantity() == 0) ? 1 : dto.quantity();
        if (EPrestationType.MEAL == prestation.getType()){
            //MealType meal = mealService.getMealTypeById(Long.valueOf(dto.name()));
            prestation.setName(dto.name());
            prestation.setQuantity(qty);
            BigDecimal unitPrice = calculateMealPrice(prestation);
            prestation.setPrice(unitPrice);
            prestation.setObservation(dto.observation());
        } else {
            prestation.setName(dto.name());
            prestation.setQuantity(qty);
            prestation.setPrice(BigDecimal.valueOf(dto.price()));
            prestation.setObservation(dto.observation());
        }

        prestation = prestationRepo.save(prestation);
        activityLogService.logActivity(
                EAuditActionTarget.PRESTATION,
                EAuditActionOperation.CREATE,
                String.format("Modification de la prestation (%s) pour le %s (Catégorie: %s).",
                        dto.name(),
                        prestation.getReservation().getPerson().getFullName(),
                        prestation.getReservation().getPerson().getGrade().getCategory().getName()
                ),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    public List<PrestationResponseDto> getResidentPrestations(Authentication authentication) {
        log.info("{} get resident prestations", authentication.getName());
        List<PrestationResponseDto> result = new ArrayList<>();
        List<Reservation> reservations = reservationRepository.findResidentReservations();
        if (reservations == null || reservations.isEmpty())
            return result;

        reservations.forEach(reservation -> {
            List<Prestation> prestations = prestationRepo.findPrestationsByReservationId(reservation.getId());
            result.add(PrestationResponseDto.mapToDto(reservation, prestations));
        });
        return result;
    }

    public List<PrestationResponseDto> getPrestationsByReservation(Authentication authentication, Long reservationCode) {
        log.info("{} get resident prestation", authentication.getName());
        List<PrestationResponseDto> result = new ArrayList<>();
        ReservationDetails details = reservationService.getReservationDetailsByCode(reservationCode);
        if (details == null || details.getReservations().isEmpty())
            return result;

        details.getReservations().forEach(reservation -> {
            List<Prestation> prestations = prestationRepo.findPrestationsByReservationId(reservation.getId());
            result.add(PrestationResponseDto.mapToDto(reservation, prestations));
        });
        return result;
    }

    @Transactional
    public void deletePrestation(Authentication authentication, String id) {
        Prestation prestation = getPrestationById(id);
        prestationRepo.delete(prestation);
        activityLogService.logActivity(
                EAuditActionTarget.PRESTATION,
                EAuditActionOperation.DELETE,
                String.format("Suppression de la préstation de Mr (%s) pour le %s.",
                        prestation.getReservation().getPerson().getFullName(),
                        prestation.getName()
                ),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////
    protected Prestation getPrestationById(String id){
        return prestationRepo.findById(id)
                .orElseThrow(()-> new BadRequestException("Prestation n'existe pas"));
    }

    public BigDecimal calculateMealPrice(Prestation prestation) {
        if (prestation.getType() != EPrestationType.MEAL || prestation.getName() == null) {
            return BigDecimal.ZERO;
        }

        Person person = prestation.getReservation().getPerson();
        if (person == null || person.getGrade() == null) {
            return BigDecimal.ZERO;
        }

        EGradeCategory category = person.getGrade().getCategory();

        return mealTypeRepository.findByName(prestation.getName())
                .map(mealType -> mealType.getPrices().stream()
                        .filter(mp -> mp.getCategory().equals(category))
                        .map(MealPrice::getPrice)
                        .findFirst()
                        .orElse(BigDecimal.ZERO))
                .orElse(BigDecimal.ZERO);
    }

}
