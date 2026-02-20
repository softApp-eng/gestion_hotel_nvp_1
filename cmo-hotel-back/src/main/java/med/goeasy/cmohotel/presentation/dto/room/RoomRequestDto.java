package med.goeasy.cmohotel.presentation.dto.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import med.goeasy.cmohotel.persistence.entity.Room;

public record RoomRequestDto(
        @NotNull(message = "pavillon obligatoire")
        Long pavillonId,
        @NotNull(message = "type obligatoire")
        Long roomTypeId,
        @NotBlank(message = "code obligatoire")
        String code,
        @NotBlank(message = "Nom obligatoire")
        String name,
        @NotNull(message = "capacité obligatoire")
        Integer capacity,
        Integer floor,
        String description,
        Boolean shared
) {
        public static Room mapToEntity(RoomRequestDto dto){
                if (dto == null)
                        return null;
                return Room.builder()
                        .code(dto.code())
                        .name(dto.name())
                        .capacity(dto.capacity())
                        .floor(dto.floor())
                        .description(dto.description())
                        .shared(dto.shared() != null && dto.shared())
                        .build();
        }
}
