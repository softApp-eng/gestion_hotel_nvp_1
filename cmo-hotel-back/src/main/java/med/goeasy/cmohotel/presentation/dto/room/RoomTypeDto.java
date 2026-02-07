package med.goeasy.cmohotel.presentation.dto.room;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.RoomType;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoomTypeDto(
        Long id,
        String type,
        String description
) {
    public static RoomTypeDto mapToDto(RoomType entity){
        if (entity == null)
            return null;
        return RoomTypeDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .description(entity.getDescription())
                .build();
    }
}
