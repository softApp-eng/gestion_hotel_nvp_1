package med.goeasy.cmohotel.presentation.dto.invoice.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record NightValidationDto(
        @NotNull(message = "la nuit est obligatoire")
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDate nightDate,
        @NotNull(message = "la reservation est obligatoire")
        List<Long> reservationCode,
        String observation
) {
}
