package med.goeasy.cmohotel.presentation.dto.profile;

import jakarta.validation.constraints.NotBlank;

public record ProfileUpdateDto(
        @NotBlank(message = "Nom obligatoire")
        String firstName,
        @NotBlank(message = "Prenom obligatoire")
        String lastName
) {
}

