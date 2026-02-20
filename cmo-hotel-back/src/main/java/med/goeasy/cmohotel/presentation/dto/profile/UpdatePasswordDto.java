package med.goeasy.cmohotel.presentation.dto.profile;

import jakarta.validation.constraints.NotBlank;

public record UpdatePasswordDto(
        @NotBlank(message = "Mot de passe actuelle obligatoire")
        String currentPassword,
        @NotBlank(message = "Nouveau mot de passe obligatoire")
        String newPassword
) {
}

