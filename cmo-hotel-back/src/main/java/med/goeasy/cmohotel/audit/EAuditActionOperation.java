package med.goeasy.cmohotel.audit;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EAuditActionOperation{

    CREATE("CREATE","Creation"),
    UPDATE("UPDATE","Modification"),
    DELETE("DELETE","Suppression"),
    SELECT("SELECT","Selection"),
    LOGIN("LOGIN","Authentication"),
    ;

    private final String code;
    private final String name;

}
