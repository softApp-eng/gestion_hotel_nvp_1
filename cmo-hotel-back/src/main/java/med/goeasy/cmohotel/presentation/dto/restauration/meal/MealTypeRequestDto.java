package med.goeasy.cmohotel.presentation.dto.restauration.meal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;

@Data
@Builder
public class MealTypeRequestDto {
    @NotNull(message = "type de repas requis")
    EMealType mealType;

    @NotBlank(message = "description requise")
    String description;
}
