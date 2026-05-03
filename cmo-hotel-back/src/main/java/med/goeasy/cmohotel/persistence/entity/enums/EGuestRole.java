package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EGuestRole {

    PRINCIPAL("PRINCIPAL","Titulaire Principal","L'invité militaire titulaire de la réservation et responsable principal.","RESPONSABLE",0),
    VICE("VICE","Mandataire / Secondant","Responsable désigné agissant au nom du titulaire en cas d'absence de ce dernier.","RESPONSABLE",1),

    SPOUSE("SPOUSE","Conjoint(e)", "Époux ou épouse du titulaire de la réservation","FAMILY",2),
    SON("SON","Fils", "Enfant de sexe masculin","FAMILY",3),
    DAUGHTER("DAUGHTER","Fille", "Enfant de sexe féminin","FAMILY",4),
    FATHER("FATHER","Père", "Père du titulaire de la réservation","FAMILY",5),
    MOTHER("MOTHER","Mère", "Mère du titulaire de la réservation","FAMILY",6),
    BROTHER("BROTHER","Frère", "Frère du titulaire de la réservation","FAMILY",7),
    SISTER("SISTER","Soeur", "Sœur du titulaire de la réservation","FAMILY",8),
    LEGAL_WARD("LEGAL_WARD","Sous tutelle", "Personne sous la protection légale du titulaire","FAMILY",9),
    CHILD("CHILD","Enfant (-18)","Enfant à charge du titulaire militaire bénéficiant du séjour.","FAMILY",10),
    ;

    private final String code;
    private final String name;
    private final String description;
    private final String groupe;
    private final int order;
}
