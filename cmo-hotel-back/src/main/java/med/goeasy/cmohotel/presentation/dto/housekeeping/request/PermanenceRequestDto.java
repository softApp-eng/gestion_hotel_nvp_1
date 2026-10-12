package med.goeasy.cmohotel.presentation.dto.housekeeping.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO de saisie d'une permanence femme de chambre.
 *
 * Une permanence = un jour + une femme de chambre de permanence.
 */
public record PermanenceRequestDto(
        @NotNull(message = "agent obligatoire")
        Long agentId,
        @NotNull(message = "date obligatoire")
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDate date
) {}
