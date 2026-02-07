package med.goeasy.cmohotel.persistence.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum EPermissionsModule {

    GENERAL("general","Général"),
    USERS("users","Utilisateurs"),
    ROLES("roles","Roles"),
    MANAGEMENT("managements","Management"),
    REPORTING("reporting","Generer des rapports"),
    PERSON("persons","Gestion les personnes"),
    PAVILLON("pavillons","Gestion les pavillons"),
    ROOM("rooms","Gestion les chambres"),
    ;

    private final String name;
    private final String expendedName;
}
