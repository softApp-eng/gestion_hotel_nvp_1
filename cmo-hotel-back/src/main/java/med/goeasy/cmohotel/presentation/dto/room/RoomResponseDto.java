package med.goeasy.cmohotel.presentation.dto.room;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Room;
import med.goeasy.cmohotel.presentation.dto.pavillon.PavillonResponseDto;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoomResponseDto(
        Long id,
        PavillonResponseDto pavillon,
        RoomTypeDto roomType,
        String code,
        String name,
        Integer capacity,
        Integer floor,
        String description,
        boolean shared
) {
        public static RoomResponseDto mapToDto(Room entity){
                if (entity == null)
                        return null;
                return RoomResponseDto.builder()
                        .id(entity.getId())
                        .pavillon(PavillonResponseDto.mapToDto(entity.getPavillon()))
                        .roomType(RoomTypeDto.mapToDto(entity.getRoomType()))
                        .code(entity.getCode())
                        .name(entity.getName())
                        .capacity(entity.getCapacity())
                        .floor(entity.getFloor())
                        .description(entity.getDescription())
                        .shared(entity.isShared())
                        .build();
        }
}
