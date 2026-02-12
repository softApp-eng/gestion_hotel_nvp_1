package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum ERelationshipType {

    SPOUSE("SPOUSE","Conjoint(e)", "Époux ou épouse du titulaire de la réservation"),
    SON("SON","Fils", "Enfant de sexe masculin"),
    DAUGHTER("DAUGHTER","Fille", "Enfant de sexe féminin"),
    FATHER("FATHER","Père", "Père du titulaire de la réservation"),
    MOTHER("MOTHER","Mère", "Mère du titulaire de la réservation"),
    BROTHER("BROTHER","Frère", "Frère du titulaire de la réservation"),
    SISTER("SISTER","Soeur", "Sœur du titulaire de la réservation"),
    OTHER("OTHER","Autre", "Autre type de parenté ou personne à charge"),
    LEGAL_WARD("LEGAL_WARD","Sous tutelle", "Personne sous la protection légale du titulaire");

    ;
    private final String code;
    private final String name;
    private final String description;

}
