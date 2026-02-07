package med.goeasy.cmohotel.security.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginWithCredentials(
        @NotBlank(message = "username required")
        String username,

        @NotBlank(message = "password required")
        String password
) {}
