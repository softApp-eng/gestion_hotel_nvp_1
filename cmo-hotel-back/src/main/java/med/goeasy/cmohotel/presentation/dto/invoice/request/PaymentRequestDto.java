package med.goeasy.cmohotel.presentation.dto.invoice.request;

import jakarta.validation.constraints.NotEmpty;

public record PaymentRequestDto(
        @NotEmpty(message = "la facture est obligatoire")
        String num,
        @NotEmpty(message = "le mode de paiement est obligatoire")
        String paymentMode,
        String priseEnChargeRef,
        String observation
) {
}
