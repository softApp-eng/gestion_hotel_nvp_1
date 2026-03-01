package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.prestation.PrestationRequestDto;
import med.goeasy.cmohotel.presentation.dto.prestation.PrestationResponseDto;
import med.goeasy.cmohotel.service.PrestationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/prestations")
@RequiredArgsConstructor
public class PrestationController {
    private final PrestationService prestationService;

    @PostMapping("/create")
    ResponseEntity<ApiResponse> create(Authentication authentication, @Valid @RequestBody PrestationRequestDto dto) {
        prestationService.createPrestation(authentication, dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Préstation créée").build());
    }

    @GetMapping("/residents")
    ResponseEntity<List<PrestationResponseDto>> getPrestationsForResidents(Authentication authentication) {
        return ResponseEntity.ok(prestationService.getResidentPrestations(authentication));
    }

    @DeleteMapping("/delete")
    ResponseEntity<ApiResponse> delete(
            Authentication authentication,
            @Valid @NotBlank(message = "prestation id requis") @RequestParam() String id) {
        prestationService.deletePrestation(authentication, id);
        return ResponseEntity.ok(ApiResponse.builder().message("Préstation supprimée").build());
    }

    /*
    @GetMapping("/meal-price")
    public BigDecimal getMealPrice(@RequestParam String mealType,
                                   @RequestParam String personId) {

        return service.getMealPriceForPerson(mealType, personId);
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
*/

}
