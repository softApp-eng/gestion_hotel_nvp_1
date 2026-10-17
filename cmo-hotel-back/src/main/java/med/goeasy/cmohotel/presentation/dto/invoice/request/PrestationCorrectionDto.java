package med.goeasy.cmohotel.presentation.dto.invoice.request;

/**
 * Correction d'une prestation facturée.
 * Les champs sont tous facultatifs : seule la valeur fournie est appliquée.
 */
public record PrestationCorrectionDto(
        String name,
        Integer quantity,
        Double price
) {
}
