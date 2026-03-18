package med.goeasy.cmohotel.presentation.dto.invoice.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.ValidatedNight;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;

import java.time.LocalDate;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ValidatedNightResponseDto(
        String id,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate nightDate,
        RoomResponseDto roomApplied,
        String roomName,
        Double roomPriceApplied
) {
    public static ValidatedNightResponseDto mapToDto(ValidatedNight entity) {
        if (entity == null)
            return null;
        return ValidatedNightResponseDto.builder()
                .id(entity.getId())
                .nightDate(entity.getNightDate())
                .roomApplied(RoomResponseDto.mapToDto(entity.getRoomApplied()))
                .roomName(entity.getRoomName())
                .roomPriceApplied(entity.getRoomPriceApplied())
                .build();
    }
}
