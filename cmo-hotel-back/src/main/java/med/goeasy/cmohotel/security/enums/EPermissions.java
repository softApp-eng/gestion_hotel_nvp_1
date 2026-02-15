package med.goeasy.cmohotel.security.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsGroup;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsModule;

@AllArgsConstructor
@Getter
public enum EPermissions {

    //default permission
    DEFAULT(EPermissionsModule.GENERAL, "default", "Default Permission", EPermissionsGroup.GENERAL,true,""),

    // USERS
    ADMIN_USERS_LIST(EPermissionsModule.USERS, "user:list", "list users",  EPermissionsGroup.READ,false,""),
    ADMIN_USERS_ONE(EPermissionsModule.USERS, "user:one", "get user",  EPermissionsGroup.READ,false,""),
    ADMIN_USERS_CREATE(EPermissionsModule.USERS, "user:create", "create user",  EPermissionsGroup.CREATE,false,""),
    ADMIN_USERS_UPDATE(EPermissionsModule.USERS, "user:update", "update user",  EPermissionsGroup.UPDATE,false,""),
    ADMIN_USERS_PASSWORD_MODIFY(EPermissionsModule.USERS, "user:password:modify", "modify user password",  EPermissionsGroup.UPDATE,false,""),
    ADMIN_USERS_ASSIGN_ROLES(EPermissionsModule.USERS, "user:assign:roles", "assign roles to user", EPermissionsGroup.MANAGE,false,""),

    //ROLES
    ADMIN_ROLES_LIST(EPermissionsModule.ROLES, "role:list", "list roles", EPermissionsGroup.READ,false,""),
    ADMIN_ROLES_PERMISSIONS_LIST(EPermissionsModule.ROLES, "permission:list", "list les permissions", EPermissionsGroup.READ,false,""),
    ADMIN_ROLES_CREATE(EPermissionsModule.ROLES, "role:create", "créer un role", EPermissionsGroup.CREATE,false,""),
    ADMIN_ROLES_UPDATE(EPermissionsModule.ROLES, "role:update", "modifier un role", EPermissionsGroup.UPDATE,false,""),
    ADMIN_ROLES_ONE(EPermissionsModule.ROLES, "role:one", "get role", EPermissionsGroup.READ,false,""),
    ADMIN_ROLES_DELETE(EPermissionsModule.ROLES, "role:delete", "supprimer role", EPermissionsGroup.DELETE,false,""),
    ADMIN_ROLES_CLONE(EPermissionsModule.ROLES, "role:clone", "cloner role", EPermissionsGroup.MANAGE,false,""),

    // PERSON
    PERSON_CREATE(EPermissionsModule.PERSON, "person:create", "Créer une personne", EPermissionsGroup.CREATE,true,""),
    PERSON_UPDATE(EPermissionsModule.PERSON, "person:update", "Modifier une personne", EPermissionsGroup.UPDATE,true,""),
    PERSON_LIST(EPermissionsModule.PERSON, "person:list", "lister les personnes", EPermissionsGroup.READ,true,""),
    PERSON_SELECT_ONE(EPermissionsModule.PERSON, "person:one", "charger une personne", EPermissionsGroup.READ,true,""),
    PERSON_DELETE(EPermissionsModule.PERSON, "person:delete", "Supprimer une personne", EPermissionsGroup.DELETE,true,""),

    // PAVILLON
    PAVILLON_CREATE(EPermissionsModule.PAVILLON, "pavillon:create", "Créer un pavillon", EPermissionsGroup.CREATE,true,""),
    PAVILLON_UPDATE(EPermissionsModule.PAVILLON, "pavillon:update", "Modifier un pavillon", EPermissionsGroup.UPDATE,true,""),
    PAVILLON_LIST(EPermissionsModule.PAVILLON, "pavillon:list", "lister les pavillons", EPermissionsGroup.READ,true,""),
    PAVILLON_SELECT_ONE(EPermissionsModule.PAVILLON, "pavillon:one", "charger un pavillon", EPermissionsGroup.READ,true,""),

    // ROOMS
    ROOM_CREATE(EPermissionsModule.ROOM, "room:create", "Créer une chambre", EPermissionsGroup.CREATE,true,""),
    ROOM_UPDATE(EPermissionsModule.ROOM, "room:update", "Modifier une chambre", EPermissionsGroup.UPDATE,true,""),
    ROOM_LIST(EPermissionsModule.ROOM, "room:list", "lister les chambres", EPermissionsGroup.READ,true,""),
    ROOM_SELECT_ONE(EPermissionsModule.ROOM, "room:one", "charger une chambre", EPermissionsGroup.READ,true,""),
    // ROOMS TYPES
    ROOM_TYPE_CREATE(EPermissionsModule.ROOM, "type:create", "Créer un type de chambre", EPermissionsGroup.CREATE,true,""),
    ROOM_TYPE_UPDATE(EPermissionsModule.ROOM, "type:update", "Modifier type de chambre", EPermissionsGroup.UPDATE,true,""),
    ROOM_TYPE_LIST(EPermissionsModule.ROOM, "type:list", "lister les types de chambres", EPermissionsGroup.READ,true,""),
    ROOM_TYPE_SELECT_ONE(EPermissionsModule.ROOM, "type:one", "charger un type de chambre", EPermissionsGroup.READ,true,""),
    ROOM_TYPE_DELETE(EPermissionsModule.ROOM, "type:delete", "supprimer un type de chambre", EPermissionsGroup.DELETE,true,""),
    // ROOMS PRICES
    ROOM_PRICE_CREATE(EPermissionsModule.ROOM, "price:create", "Créer un price de chambre", EPermissionsGroup.CREATE,true,""),
    ROOM_PRICE_UPDATE(EPermissionsModule.ROOM, "price:update", "Modifier price de chambre", EPermissionsGroup.UPDATE,true,""),
    ROOM_PRICE_LIST(EPermissionsModule.ROOM, "price:list", "lister les prices de chambres", EPermissionsGroup.READ,true,""),
    ROOM_PRICE_SELECT_ONE(EPermissionsModule.ROOM, "price:one", "charger un price de chambre", EPermissionsGroup.READ,true,""),
    ROOM_PRICE_DELETE(EPermissionsModule.ROOM, "price:delete", "supprimer un price de chambre", EPermissionsGroup.DELETE,true,""),

    // RESERVATIONS
    RESERVATION_CREATE(EPermissionsModule.RESERVATION, "reservation:create", "Créer une réservation", EPermissionsGroup.CREATE,true,""),
    RESERVATION_LIST(EPermissionsModule.RESERVATION, "reservation:list", "lister les réservations", EPermissionsGroup.READ,true,""),
    RESERVATION_ONE(EPermissionsModule.RESERVATION, "reservation:one", "charger une réservation", EPermissionsGroup.READ,true,""),



    ;


    private final EPermissionsModule module;
    private final String action;
    private final String title;
    private final EPermissionsGroup group;
    private final boolean affectable;
    private final String description;

    public String getAuthority() {
        // Using module.name() or a specific code field is more reliable
        return String.format("%s:%s", this.module.getName(), this.action);
    }
}
