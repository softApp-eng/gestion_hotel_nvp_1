package med.goeasy.cmohotel.presentation.dto.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.SwitchedRoom;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;

import java.time.LocalDateTime;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SwitchRoomResponseDto(
        Long id,
        RoomResponseDto previousRoom,
        RoomResponseDto newRoom,
        String reason,
        //@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime switchTime
) {
        public static SwitchRoomResponseDto mapToDto(SwitchedRoom entity){
                if (entity == null)
                        return null;
                return SwitchRoomResponseDto.builder()
                        .id(entity.getId())
                        .previousRoom(RoomResponseDto.mapToDto(entity.getPreviousRoom()))
                        .newRoom(RoomResponseDto.mapToDto(entity.getNewRoom()))
                        .reason(entity.getReason())
                        .switchTime(entity.getSwitchTime())
                        .build();
        }
}
