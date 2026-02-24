package med.goeasy.cmohotel.presentation.dto.housekeeping.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

public record UpdateRoomCleanRequest(
        @NotNull(message = "chambre obligatoire")
        Long roomId,
        @NotNull(message = "Etat de chambre obligatoire")
        boolean clean,
        String comment,
        @NotNull(message = "Agent obligatoire")
        Long agentId,
        @NotNull(message = "Date/heure de debut obligatoire")
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
        LocalDateTime startAt,
        @NotNull(message = "Date/heure de fin obligatoire")
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
        LocalDateTime endAt
) {}

