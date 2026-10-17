package med.goeasy.cmohotel.presentation.dto.invoice.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.InvoicePrestation;
import med.goeasy.cmohotel.persistence.entity.enums.EPrestationType;

import java.time.LocalDate;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvoicePrestationResponseDto(
        Long id,
        EPrestationType type,
        String name,
        String guestName,
        Integer quantity,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate day,
        Double price
) {
    public static InvoicePrestationResponseDto mapToDto(InvoicePrestation entity) {
        if (entity == null)
            return null;
        return InvoicePrestationResponseDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .name(entity.getName())
                .guestName(entity.getGuestName())
                .quantity(entity.getQuantity())
                .day(entity.getDay())
                .price(entity.getPrice())
                .build();
    }
}
