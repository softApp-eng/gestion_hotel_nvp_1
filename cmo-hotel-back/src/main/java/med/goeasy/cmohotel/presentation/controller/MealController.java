package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.meal.MealPriceRequestDto;
import med.goeasy.cmohotel.presentation.dto.meal.MealPriceResponseDto;
import med.goeasy.cmohotel.presentation.dto.meal.MealTypeRequestDto;
import med.goeasy.cmohotel.presentation.dto.meal.MealTypeResponseDto;
import med.goeasy.cmohotel.service.MealService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    /// /////////////////////////////////////////////////////////////////////////////
    ///                               MEALS TYPES                                 ///
    /// /////////////////////////////////////////////////////////////////////////////

    @GetMapping("/type/all")
    ResponseEntity<List<MealTypeResponseDto>> getAllmealTypes() {
        return ResponseEntity.ok(mealService.allTypes());
    }

    // CREATE
    @PostMapping("/type/create")
    ResponseEntity<ApiResponse> createMealType(
            Authentication authentication,
            @Valid @RequestBody MealTypeRequestDto dto
    ) {
        mealService.createMealType(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Type repas créé").build());
    }

    // UPDATE
    @PutMapping("/type/update")
    public ResponseEntity<?> update(
            Authentication authentication,
            @Valid @RequestBody MealTypeRequestDto dto,
            @Valid @NotNull(message = "id type requis") @RequestParam() Long id
    ) {
        mealService.updateType(authentication, id, dto);
        return ResponseEntity.ok(ApiResponse.builder().message("type modifiée").build());
    }


    // DELETE
    @DeleteMapping("/type/delete")
    ResponseEntity<ApiResponse> delete(@RequestParam Long id) {
        mealService.delete(id);
        return ResponseEntity.ok(ApiResponse.builder().message("Type supprimé").build());
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                               MEALS PRICES                                ///
    /// /////////////////////////////////////////////////////////////////////////////

    @GetMapping("/price/byType")
    public ResponseEntity<List<MealPriceResponseDto>> getPricesByType(
            Authentication authentication,
            @Valid @NotNull(message = "id type requis") @RequestParam() Long id
    ) {
        return ResponseEntity.ok(mealService.getPricesByType(authentication, id));
    }

    @GetMapping("/price/one")
    public ResponseEntity<MealPriceResponseDto> getOnePrice(
            Authentication authentication,
            @Valid @NotNull(message = "id prix requis") @RequestParam() Long id
    ) {
        return ResponseEntity.ok(mealService.getOne(authentication, id));
    }

    @PostMapping("/price/create")
    public ResponseEntity<ApiResponse> createPrice(
            Authentication authentication,
            @Valid @RequestBody MealPriceRequestDto dto
    ) {
        mealService.createPrice(authentication, dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Prix créé").build());
    }

    @PutMapping("/price/update")
    public ResponseEntity<ApiResponse> updatePrice(
            Authentication authentication,
            @Valid @RequestBody MealPriceRequestDto dto,
            @Valid @NotNull(message = "id prix requis") @RequestParam() Long id
    ) {
        mealService.updatePrice(authentication, dto, id);
        return ResponseEntity.ok(ApiResponse.builder().message("Prix modifié").build());
    }

    @DeleteMapping("/price/delete")
    public ResponseEntity<ApiResponse> deletePrice(
            Authentication authentication,
            @Valid @NotNull(message = "id prix requis") @RequestParam() Long id
    ) {
        mealService.delete(authentication, id);
        return ResponseEntity.ok(ApiResponse.builder().message("Prix supprimé").build());
    }
}

