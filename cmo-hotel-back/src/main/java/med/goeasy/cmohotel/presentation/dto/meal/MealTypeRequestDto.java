package med.goeasy.cmohotel.presentation.dto.meal;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MealTypeRequestDto {
    @NotBlank(message = "Nom de repas requis")
    String name;

    String description;
}
