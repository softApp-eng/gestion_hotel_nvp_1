package med.goeasy.cmohotel.presentation.dto.room;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.time.LocalDateTime;
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SwitchedRoomDto(
        Long id,
        RoomResponseDto previousRoom,
        RoomResponseDto newRoom,
        LocalDateTime switchTime,
        String reason,
        Double appliedPrice,
        Double previousPrice
) {
}
