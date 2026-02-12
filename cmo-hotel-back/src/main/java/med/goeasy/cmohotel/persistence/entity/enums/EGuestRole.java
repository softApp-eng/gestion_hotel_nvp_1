package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EGuestRole {

    PRINCIPAL("PRINCIPAL","Titulaire Principal","L'invité militaire titulaire de la réservation et responsable principal."),
    VICE("VICE","Mandataire / Secondant","Responsable désigné agissant au nom du titulaire en cas d'absence de ce dernier."),
    FAMILY("FAMILY","Membre Famille","Membre de la famille (conjoint, ascendant) accompagnant le titulaire."),
    CHILD("CHILD","Enfant","Enfant à charge du titulaire militaire bénéficiant du séjour.")
    ;

    private final String code;
    private final String name;
    private final String description;
}
