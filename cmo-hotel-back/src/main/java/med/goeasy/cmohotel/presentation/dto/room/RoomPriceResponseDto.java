package med.goeasy.cmohotel.presentation.dto.room;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.RoomPrice;
import med.goeasy.cmohotel.persistence.entity.RoomType;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoomPriceResponseDto(
        Long id,
        //RoomTypeDto roomType,
        EGradeCategory category,
        Double price
) {
    public static RoomPriceResponseDto mapToDto(RoomPrice entity){
        if (entity == null)
            return null;
        return RoomPriceResponseDto.builder()
                .id(entity.getId())
                //.roomType(RoomTypeDto.mapToDto(entity.getRoomType()))
                .category(entity.getCategory())
                .price(entity.getPrice())
                .build();
    }
}
