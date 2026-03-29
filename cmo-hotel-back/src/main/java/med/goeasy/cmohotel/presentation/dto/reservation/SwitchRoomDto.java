package med.goeasy.cmohotel.presentation.dto.reservation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record SwitchRoomDto(
        @NotBlank(message = "reservation requise")
        String reservationId,
        @NotNull(message = "chambre requise")
        Long newRoomId,
        String reason
        //@NotNull(message = "La date est obligatoire")
        //LocalDateTime switchTime
) {
}
