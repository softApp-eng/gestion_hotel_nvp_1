package med.goeasy.cmohotel.presentation.dto.invoice.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Invoice;
import med.goeasy.cmohotel.persistence.entity.ValidatedNight;
import med.goeasy.cmohotel.persistence.entity.enums.EInvoiceStatus;
import med.goeasy.cmohotel.persistence.entity.enums.EPaymentMode;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationDetailsResponseDto;
import med.goeasy.cmohotel.utils.MissingNights;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvoiceResponseDto(
        String num,
        ReservationDetailsResponseDto reservationDetails,
        String invoiceNumber,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime issuedAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime paidAt,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime checkin,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime checkout,

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
        List<InvoicePrestationResponseDto> invoicePrestations,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        List<LocalDate> missingNights
        ) {
    public static InvoiceResponseDto mapToDto(Invoice entity) {
        if (entity == null)
            return null;
        List<LocalDate> validatedDates = entity.getValidatedNights() == null ? List.of()
                : entity.getValidatedNights().stream()
                        .map(ValidatedNight::getNightDate)
                        .filter(Objects::nonNull)
                        .toList();
        return InvoiceResponseDto.builder()
                .num(entity.getNum())
                .reservationDetails(ReservationDetailsResponseDto.mapToDto(entity.getReservationDetails()))
                .checkin(entity.getCheckin())
                .checkout(entity.getCheckout())
                .invoiceNumber(entity.getInvoiceNumber())
                .issuedAt(entity.getIssuedAt())
                .createdAt(entity.getCreatedAt())
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
                .missingNights(entity.getReservationDetails() != null
                        ? MissingNights.of(
                                entity.getReservationDetails().getCheckin(),
                                entity.getReservationDetails().getCheckout(),
                                validatedDates)
                        : List.of())
                .build();
    }
}
