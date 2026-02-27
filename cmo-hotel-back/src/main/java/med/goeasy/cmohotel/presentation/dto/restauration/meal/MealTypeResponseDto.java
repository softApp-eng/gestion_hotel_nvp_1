package med.goeasy.cmohotel.presentation.dto.restauration.meal;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.MealType;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;

import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MealTypeResponseDto (
        Long id,
        EMealType mealType,
        String description,
        List<MealPriceResponseDto> prices
) {
    public static MealTypeResponseDto mapToDto(MealType entity){
        return MealTypeResponseDto.builder()
                .id(entity.getId())
                .mealType(entity.getMealType())
                .description(entity.getDescription())
                .prices(entity.getPrices().stream().map(MealPriceResponseDto::mapToDto).toList())
                .build();
    }
}
