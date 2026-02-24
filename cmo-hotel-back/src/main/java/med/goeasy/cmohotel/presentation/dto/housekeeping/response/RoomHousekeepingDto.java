package med.goeasy.cmohotel.presentation.dto.housekeeping.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.HousekeepingHistory;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;

import java.time.LocalDateTime;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoomHousekeepingDto(
        Long id,
        RoomResponseDto room,
        HousekeepingAgentResponseDto agent,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime startAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime endAt,
        String comment
) {
    public static RoomHousekeepingDto mapToDto(HousekeepingHistory entity){
        if (entity == null)
            return null;
        return RoomHousekeepingDto.builder()
                .id(entity.getId())
                .startAt(entity.getStartAt())
                .endAt(entity.getEndAt())
                .comment(entity.getComment())
                .room(RoomResponseDto.mapToDto(entity.getRoom()))
                .agent(HousekeepingAgentResponseDto.mapToDto(entity.getAgent()))
                .build();
    }
}
