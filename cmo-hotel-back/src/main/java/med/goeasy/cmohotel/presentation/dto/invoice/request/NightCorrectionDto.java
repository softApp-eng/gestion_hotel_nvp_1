package med.goeasy.cmohotel.presentation.dto.invoice.request;

/**
 * Correction d'une nuitée d'hébergement facturée.
 * Les champs sont tous facultatifs : seule la valeur fournie est appliquée.
 */
public record NightCorrectionDto(
        Double price,
        String observation
) {
}
