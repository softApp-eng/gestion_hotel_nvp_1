package med.goeasy.cmohotel.persistence.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum EPermissionsModule {

    GENERAL("general","Général"),
    USERS("users","Utilisateurs"),
    AUDIT("audits","Audit"),
    ROLES("roles","Roles"),
    MANAGEMENT("managements","Management"),
    REPORTING("reporting","Generer des rapports"),
    PERSON("persons","Gestion des personnes"),
    PAVILLON("pavillons","Gestion des pavillons"),
    ROOM("rooms","Gestion des chambres"),
    RESERVATION("reservations","Gestion des réservation"),
    HOUSE_KEEPING("housekeepings","Gestion des ménage"),
    CONFIGURATION("configurations","Configuration de la plateforme"),
    ;

    private final String name;
    private final String expendedName;
}
