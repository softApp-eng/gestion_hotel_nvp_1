package med.goeasy.cmohotel.presentation.dto.meal;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.MealType;

import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MealTypeResponseDto (
        Long id,
        String name,
        String description,
        List<MealPriceResponseDto> prices
) {
    public static MealTypeResponseDto mapToDto(MealType entity){
        return MealTypeResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .prices(entity.getPrices().stream().map(MealPriceResponseDto::mapToDto).toList())
                .build();
    }
}
