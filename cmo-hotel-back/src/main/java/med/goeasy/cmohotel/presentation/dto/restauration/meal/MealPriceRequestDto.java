package med.goeasy.cmohotel.presentation.dto.restauration.meal;

import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;

import java.math.BigDecimal;

public record MealPriceRequestDto(
        Long mealTypeId,
        EGradeCategory category,
        BigDecimal price
) {}
