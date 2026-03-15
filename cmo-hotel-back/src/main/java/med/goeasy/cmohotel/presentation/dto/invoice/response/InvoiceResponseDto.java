package med.goeasy.cmohotel.presentation.dto.invoice.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Invoice;
import med.goeasy.cmohotel.persistence.entity.enums.EInvoiceStatus;
import med.goeasy.cmohotel.persistence.entity.enums.EPaymentMode;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationDetailsResponseDto;

import java.time.LocalDateTime;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvoiceResponseDto(
        String num,
        ReservationDetailsResponseDto reservationDetails,
        String invoiceNumber,
        LocalDateTime issuedAt,
        LocalDateTime paidAt,
        EPaymentMode paymentMode,
        Double totalRoomPrice,
        Double totalPrestationPrice,
        boolean priseEnCharge,
        String priseEnChargeReference,
        EReservationCategory category,
        EInvoiceStatus status,
        String description
) {
    public static InvoiceResponseDto mapToDto(Invoice entity) {
        if (entity == null)
            return null;
        return InvoiceResponseDto.builder()
                .num(entity.getNum())
                .reservationDetails(ReservationDetailsResponseDto.mapToDtoWithoutGuests(entity.getReservationDetails()))
                .invoiceNumber(entity.getInvoiceNumber())
                .issuedAt(entity.getIssuedAt())
                .paidAt(entity.getPaidAt())
                .paymentMode(entity.getPaymentMode())
                .totalRoomPrice(entity.getTotalRoomPrice())
                .totalPrestationPrice(entity.getTotalPrestationPrice())
                .priseEnCharge(entity.isPriseEnCharge())
                .priseEnChargeReference(entity.getPriseEnChargeReference())
                .category(entity.getCategory())
                .status(entity.getStatus())
                .description(entity.getDescription())
                .build();
    }
}
