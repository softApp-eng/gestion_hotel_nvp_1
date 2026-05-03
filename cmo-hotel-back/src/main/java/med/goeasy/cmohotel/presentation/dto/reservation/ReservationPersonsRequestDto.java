package med.goeasy.cmohotel.presentation.dto.reservation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReservationPersonsRequestDto(
        @NotBlank(message = "Personne obligatoire")
        String personId,
        @NotBlank(message = "Role de la personne obligatoire")
        String role,
        @NotNull(message = "Chambre obligatoire")
        Long roomId,
        Double appliedPrice
) {
}
