package med.goeasy.cmohotel.presentation.dto.prestation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PrestationPersonRequestDto(
        @NotNull(message = "Personne obligatoire")
        String reservation,
        @NotBlank(message = "service obligatoire")
        String name,
        @NotNull(message = "quantité obligatoire")
        Integer quantity,
        @NotBlank(message = "quantité obligatoire")
        String type,
        Double price,
        String observation
) {

}
