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
    DELEGATION("DELEGATION","Délégation", "Groupe de personnes d'une délégation ou un événements pour un motif officiel."),
   ;

    private final String code;
    private final String name;
    private final String description;

}
