package med.goeasy.cmohotel.presentation.dto.reservation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record ReservationRequestDto(
        @NotNull(message = "Date debut de la réservation obligatoire")
        LocalDate startDate,
        @NotNull(message = "Date fin de la réservation obligatoire")
        LocalDate endDate,
        @NotBlank(message = "Category de la reservation est obligatoire")
        String category,
        @NotNull(message = "Aucune personne selectionnée")
        List<ReservationPersonsRequestDto> persons
) {
}
