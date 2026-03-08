package med.goeasy.cmohotel.presentation.dto.room;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Room;
import med.goeasy.cmohotel.presentation.dto.Range;
import med.goeasy.cmohotel.presentation.dto.pavillon.PavillonResponseDto;

import java.util.List;

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
        boolean shared,
        boolean clean,
        boolean available,
        boolean reserved,
        List<Range> reservationsRanges
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
                        .clean(entity.isClean())
                        .available(entity.isAvailable())
                        .build();
        }

        public static RoomResponseDto mapToDtoWithReservationStatus(Room entity, boolean isReserved){
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
                        .clean(entity.isClean())
                        .available(entity.isAvailable())
                        .reserved(isReserved)
                        .build();
        }

        public static RoomResponseDto mapToDtoWithReservationRanges(Room entity, List<Range> reservationsRanges){
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
                        .clean(entity.isClean())
                        .available(entity.isAvailable())
                        .reservationsRanges(reservationsRanges)
                        .build();
        }
}
