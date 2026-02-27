package med.goeasy.cmohotel.presentation.controller;

import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.Prestation;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationResponseDto;
import med.goeasy.cmohotel.presentation.dto.restauration.PrestationRequestDto;
import med.goeasy.cmohotel.service.MealService;
import med.goeasy.cmohotel.service.PrestationService;
import med.goeasy.cmohotel.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/v1/restauration")
@RequiredArgsConstructor
public class RestaurationController {
    private final MealService service;
    private final PrestationService prestationService;
    private final ReservationService reservationService;

    @GetMapping("/meal-price")
    public BigDecimal getMealPrice(@RequestParam EMealType mealType,
                                   @RequestParam String personId) {

        return service.getMealPriceForPerson(mealType, personId);
    }
    @PostMapping("/create")
    public Prestation create(@RequestBody PrestationRequestDto request) {
        return prestationService.createPrestation(request);
    }
    @GetMapping("/all")
    public ResponseEntity<List<Prestation>> getAllPrestations() {
        List<Prestation> prestations = prestationService.getAllPrestations();
        return ResponseEntity.ok(prestations);
    }
     @PutMapping("/update/{id}")
    public ResponseEntity<Prestation> update(@PathVariable String id,
                                             @RequestBody PrestationRequestDto request) {
        Prestation updated = prestationService.updatePrestation(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

     @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        boolean deleted = prestationService.deletePrestation(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/persons/{personId}/active-reservation")
    public ReservationResponseDto getActiveReservation(
            @PathVariable String personId
    ){
        return reservationService.getActiveReservationByPerson(personId);
    }


}
