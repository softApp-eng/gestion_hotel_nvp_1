package med.goeasy.cmohotel.presentation.dto.user;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserPasswordDto(
        @NotBlank(message = "Mot de passe obligatoire")
        String password
) {
}

