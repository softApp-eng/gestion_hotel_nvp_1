package med.goeasy.cmohotel.presentation.dto.prestation;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record PrestationRequestDto(
        @NotNull(message = "Personne obligatoire")
        Map<String,Integer> reservations,
        @NotNull(message = "repas obligatoire")
        Long mealId,
        String observation
) {

}
