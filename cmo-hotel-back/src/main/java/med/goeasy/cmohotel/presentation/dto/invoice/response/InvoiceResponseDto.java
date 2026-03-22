package med.goeasy.cmohotel.presentation.dto.invoice.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Invoice;
import med.goeasy.cmohotel.persistence.entity.enums.EInvoiceStatus;
import med.goeasy.cmohotel.persistence.entity.enums.EPaymentMode;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationDetailsResponseDto;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvoiceResponseDto(
        String num,
        ReservationDetailsResponseDto reservationDetails,
        String invoiceNumber,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime issuedAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime paidAt,
        EPaymentMode paymentMode,
        Double totalRoomPrice,
        Double totalPrestationPrice,
        boolean priseEnCharge,
        String priseEnChargeReference,
        EReservationCategory category,
        EInvoiceStatus status,
        String description,
        InvoiceDetailsResponseDto details,
        List<ValidatedNightResponseDto> validatedNights,
        List<InvoicePrestationResponseDto> invoicePrestations
        ) {
    public static InvoiceResponseDto mapToDto(Invoice entity) {
        if (entity == null)
            return null;
        return InvoiceResponseDto.builder()
                .num(entity.getNum())
                .reservationDetails(ReservationDetailsResponseDto.mapToDto(entity.getReservationDetails()))
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
                .validatedNights(
                        entity.getValidatedNights().stream().map(ValidatedNightResponseDto::mapToDto).toList()

                )
                .invoicePrestations(
                        entity.getInvoicePrestations().stream().map(InvoicePrestationResponseDto::mapToDto).toList()

                )
                .details(InvoiceDetailsResponseDto.mapToDto(entity.getDetails()))
                .build();
    }
}
