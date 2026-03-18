package med.goeasy.cmohotel.presentation.dto.invoice.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.InvoiceDetails;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvoiceDetailsResponseDto(
        Long id,
        List<InvoiceRoomResponseDto> invoiceRooms
) {
    public static InvoiceDetailsResponseDto mapToDto(InvoiceDetails entity) {
        if (entity == null)
            return null;
        return InvoiceDetailsResponseDto.builder()
                .id(entity.getId())
                .invoiceRooms(
                        entity.getInvoiceRooms().stream().map(InvoiceRoomResponseDto::mapToDto).toList()
                )
                .build();
    }
}
