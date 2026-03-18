package med.goeasy.cmohotel.presentation.dto.invoice.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.InvoiceRoom;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvoiceRoomResponseDto(
        Long id,
        String roomName,
        String roomType,
        List<InvoiceGuestResponseDto> guests
) {
    public static InvoiceRoomResponseDto mapToDto(InvoiceRoom entity) {
        if (entity == null)
            return null;
        return InvoiceRoomResponseDto.builder()
                .id(entity.getId())
                .roomName(entity.getRoomName())
                .roomType(entity.getRoomType())
                .guests(
                        entity.getGuests().stream().map(InvoiceGuestResponseDto::mapToDto).toList()

                )
                .build();
    }
}
