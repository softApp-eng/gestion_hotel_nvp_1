package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.prestation.PrestationPersonRequestDto;
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
    ResponseEntity<ApiResponse> createBulk(Authentication authentication, @Valid @RequestBody PrestationRequestDto dto) {
        prestationService.createPrestation(authentication, dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Prestation créée").build());
    }

    @PostMapping("/reservation/create")
    ResponseEntity<ApiResponse> createOne(Authentication authentication, @Valid @RequestBody PrestationPersonRequestDto dto) {
        prestationService.createPersonPrestation(authentication, dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Prestation créée").build());
    }

    @PutMapping("/update")
    ResponseEntity<ApiResponse> update(Authentication authentication,
                                       @Valid @RequestBody PrestationPersonRequestDto dto,
                                       @Valid @NotBlank(message = "prestation id requis") @RequestParam() String id) {
        prestationService.updatePrestation(authentication, dto, id);
        return ResponseEntity.ok(ApiResponse.builder().message("Prestation modifiée").build());
    }

    @GetMapping("/residents")
    ResponseEntity<List<PrestationResponseDto>> getPrestationsForResidents(Authentication authentication) {
        return ResponseEntity.ok(prestationService.getResidentPrestations(authentication));
    }

    @GetMapping("/reservation")
    ResponseEntity<List<PrestationResponseDto>> getPrestationsByReservation(Authentication authentication,@Valid @NotNull(message = "reservation code requis") @RequestParam() Long code) {
        return ResponseEntity.ok(prestationService.getPrestationsByReservation(authentication, code));
    }

    @DeleteMapping("/delete")
    ResponseEntity<ApiResponse> delete(
            Authentication authentication,
            @Valid @NotBlank(message = "prestation id requis") @RequestParam() String id,
            @RequestParam(required = false) String reason) {
        prestationService.deletePrestation(authentication, id, reason);
        return ResponseEntity.ok(ApiResponse.builder().message("Prestation supprimée").build());
    }

}
