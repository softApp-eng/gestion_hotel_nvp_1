package med.goeasy.cmohotel.presentation.dto.user;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequestDto(
        @NotBlank(message = "Nom d'utilisateur obligatoire")
        String username,
        Boolean status,
        String firstName,
        String lastName
) {
}

