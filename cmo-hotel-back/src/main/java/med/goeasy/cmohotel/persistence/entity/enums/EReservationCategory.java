package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EReservationCategory {

    SINGLE("SINGLE","Individuel", "Séjour pour une personne seule, généralement en mission ou passage."),
    FAMILY("FAMILY","Famille", "Séjour incluant le titulaire et ses ayants droit (conjoint, enfants)."),
    DELEGATION("DELEGATION","Délégation", "Groupe de personnes voyageant ensemble pour un motif officiel."),
    VIP("VIP","Hôte de marque", "Réservation prioritaire pour les hautes autorités ou invités de marque."),
    PASSAGE("PASSAGE","Passage", "Séjour de très courte durée, souvent sans planification préalable."),
    COLLECTIVE("COLLECTIVE","Collectif", "Réservation de groupe pour des stages, formations ou événements."),
    EMERGENCY("EMERGENCY","Urgence", "Réservation exceptionnelle pour des raisons de service ou force majeure.");
    ;

    private final String code;
    private final String name;
    private final String description;

}
