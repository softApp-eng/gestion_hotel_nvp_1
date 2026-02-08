package med.goeasy.cmohotel.presentation.dto.room;

import jakarta.validation.constraints.NotBlank;

public record RoomTypeRequestDto(
        @NotBlank(message = "Type de chambre obligatoire")
        String type,
        String description
) {
}
