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
import med.goeasy.cmohotel.persistence.entity.MealType;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.Prestation;
import med.goeasy.cmohotel.persistence.entity.Reservation;
import med.goeasy.cmohotel.persistence.repository.PersonRepository;
import med.goeasy.cmohotel.persistence.repository.PrestationRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.presentation.dto.prestation.PrestationRequestDto;
import med.goeasy.cmohotel.presentation.dto.prestation.PrestationResponseDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationResponseDto;
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
    private final PersonRepository personRepo;
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
                    .mealType(meal)
                    .quantity((q == null || q == 0)?1:q)
                    .observation(dto.observation())
                    .day(LocalDate.now())
                    .build();
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

    @Transactional
    public void deletePrestation(Authentication authentication, String id) {
        Prestation prestation = getPrestationById(id);
        prestationRepo.delete(prestation);
        activityLogService.logActivity(
                EAuditActionTarget.PRESTATION,
                EAuditActionOperation.DELETE,
                String.format("Suppression de la préstation de Mr (%s) pour le %s.",
                        prestation.getReservation().getPerson().getFullName(),
                        prestation.getMealType().getName()
                ),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

/*
    public Prestation updatePrestation(String id, PrestationRequestDto request) {
        Optional<Prestation> optionalPrestation = prestationRepo.findById(id);
        if (!optionalPrestation.isPresent()) {
            return null;
        }

        Prestation prestation = optionalPrestation.get();

         Person person = personRepo.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Personne introuvable"));
        prestation.setPerson(person);

        prestation.setMealType(request.getMealType());
        prestation.setQuantity(request.getQuantity());
        prestation.setObservation(request.getObservation());

        BigDecimal price = mealService.getMealPriceForPerson(request.getMealType().getName(), request.getPersonId());
        prestation.setPrice(price.doubleValue());
        prestation.setTotalPrice(price.multiply(BigDecimal.valueOf(request.getQuantity())).doubleValue());

        return prestationRepo.save(prestation);
    }
*/

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////
    protected Prestation getPrestationById(String id){
        return prestationRepo.findById(id)
                .orElseThrow(()-> new BadRequestException("Prestation n'existe pas"));
    }

}
