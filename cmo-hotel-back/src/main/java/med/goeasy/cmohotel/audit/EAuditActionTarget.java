package med.goeasy.cmohotel.audit;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EAuditActionTarget{

    RESERVATION("RESERVATION","Réservation"),
    PAVILLON("PAVILLON","Pavillon"),
    PERSON("PERSON","Personne"),
    ROLE("ROLE","Role"),
    ROOM("ROOM","Chambre"),
    ROOM_TYPE("ROOM_TYPE","Type de chambre"),
    ROOM_PRICE("ROOM_PRICE","Prix de chambre"),
    USER("USER","Utilisateur"),
    AUTH("AUTH","Authentication"),
    HOUSEKEEPING("HOUSEKEEPING","House keeping"),
    ;

    private final String code;
    private final String name;

}
