package med.goeasy.cmohotel.presentation.dto.user;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequestDto(
        @NotBlank(message = "Nom d'utilisateur obligatoire")
        String username,
        @NotBlank(message = "Mot de passe obligatoire")
        String password,
        Boolean status,
        String firstName,
        String lastName
) {
}

