package med.goeasy.cmohotel.presentation.dto.restauration.meal;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.MealPrice;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;

import java.math.BigDecimal;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MealPriceResponseDto(
        Long id,
        //Long mealTypeId,
        //String mealType,
        EGradeCategory category,
        BigDecimal price
) {
    public static MealPriceResponseDto mapToDto(MealPrice p){
        return MealPriceResponseDto.builder()
                .id(p.getId())
                .category(p.getCategory())
                .price(p.getPrice())
                .build();
    }
}
