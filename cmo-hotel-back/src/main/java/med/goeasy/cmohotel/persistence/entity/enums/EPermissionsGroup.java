package med.goeasy.cmohotel.persistence.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum EPermissionsGroup {

    ADMINISTRATOR("administrator"),
    CREATE("create"),
    UPDATE("update"),
    DELETE("delete"),
    READ("read"),
    GENERAL("general"),
    MANAGE("manage"),
    REPORTING("reporting"),
    ;

    private final String name;
}
