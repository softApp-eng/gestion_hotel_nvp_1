package med.goeasy.cmohotel.security.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsGroup;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsModule;

import static med.goeasy.cmohotel.persistence.entity.enums.EPermissionsGroup.*;
import static med.goeasy.cmohotel.persistence.entity.enums.EPermissionsModule.*;

@AllArgsConstructor
@Getter
public enum EPermissions {

    //default permission
    DEFAULT(EPermissionsModule.GENERAL, "default", "Default Permission", EPermissionsGroup.GENERAL,true,""),

    // USERS
    ADMIN_USERS_LIST(USERS, "user:list", "list users",  READ,false,""),
    ADMIN_USERS_ONE(USERS, "user:one", "get user",  READ,false,""),
    ADMIN_USERS_CREATE(USERS, "user:create", "create user",  CREATE,false,""),
    ADMIN_USERS_UPDATE(USERS, "user:update", "update user",  UPDATE,false,""),
    ADMIN_USERS_PASSWORD_MODIFY(USERS, "user:password:modify", "modify user password",  UPDATE,false,""),
    ADMIN_USERS_ASSIGN_ROLES(USERS, "user:assign:roles", "assign roles to user", MANAGE,false,""),
    ADMIN_USERS_RESOURCES_MANAGE(USERS, "user:resources:manage", "Gérer les ressources des utilisateurs", MANAGE,false,""),
    ADMIN_AUDIT_ACTIVITY_LOGS(AUDIT, "logs:filter", "filtrer les activités des utilisateurs", MANAGE,false,""),

    //ROLES
    ADMIN_ROLES_LIST(ROLES, "role:list", "list roles", READ,false,""),
    ADMIN_ROLES_PERMISSIONS_LIST(ROLES, "permission:list", "list les permissions", READ,false,""),
    ADMIN_ROLES_CREATE(ROLES, "role:create", "créer un role", CREATE,false,""),
    ADMIN_ROLES_UPDATE(ROLES, "role:update", "modifier un role", UPDATE,false,""),
    ADMIN_ROLES_ONE(ROLES, "role:one", "get role", READ,false,""),
    ADMIN_ROLES_DELETE(ROLES, "role:delete", "supprimer role", DELETE,false,""),
    ADMIN_ROLES_CLONE(ROLES, "role:clone", "cloner role", MANAGE,false,""),

    // PERSON
    PERSON_CREATE(PERSON, "person:create", "Créer une personne", CREATE,true,""),
    PERSON_UPDATE(PERSON, "person:update", "Modifier une personne", UPDATE,true,""),
    PERSON_LIST(PERSON, "person:list", "lister les personnes", READ,true,""),
    PERSON_SELECT_ONE(PERSON, "person:one", "charger une personne", READ,true,""),
    PERSON_DELETE(PERSON, "person:delete", "Supprimer une personne", DELETE,true,""),

    // PAVILLON
    PAVILLON_CREATE(PAVILLON, "pavillon:create", "Créer un pavillon", CREATE,true,""),
    PAVILLON_UPDATE(PAVILLON, "pavillon:update", "Modifier un pavillon", UPDATE,true,""),
    PAVILLON_LIST(PAVILLON, "pavillon:list", "lister les pavillons", READ,true,""),
    PAVILLON_SELECT_ONE(PAVILLON, "pavillon:one", "charger un pavillon", READ,true,""),

    // ROOMS
    ROOM_CREATE(ROOM, "room:create", "Créer une chambre", CREATE,true,""),
    ROOM_UPDATE(ROOM, "room:update", "Modifier une chambre", UPDATE,true,""),
    ROOM_LIST(ROOM, "room:list", "lister les chambres", READ,true,""),
    ROOM_LIST_GRANTED(ROOM, "room:granted", "lister les chambres affectées", READ,true,""),
    ROOM_SELECT_ONE(ROOM, "room:one", "charger une chambre", READ,true,""),
    // ROOMS TYPES
    ROOM_TYPE_CREATE(ROOM, "type:create", "Créer un type de chambre", CREATE,true,""),
    ROOM_TYPE_UPDATE(ROOM, "type:update", "Modifier type de chambre", UPDATE,true,""),
    ROOM_TYPE_LIST(ROOM, "type:list", "lister les types de chambres", READ,true,""),
    ROOM_TYPE_SELECT_ONE(ROOM, "type:one", "charger un type de chambre", READ,true,""),
    ROOM_TYPE_DELETE(ROOM, "type:delete", "supprimer un type de chambre", DELETE,true,""),
    // ROOMS PRICES
    ROOM_PRICE_CREATE(ROOM, "price:create", "Créer un price de chambre", CREATE,true,""),
    ROOM_PRICE_UPDATE(ROOM, "price:update", "Modifier price de chambre", UPDATE,true,""),
    ROOM_PRICE_LIST(ROOM, "price:list", "lister les prices de chambres", READ,true,""),
    ROOM_PRICE_SELECT_ONE(ROOM, "price:one", "charger un price de chambre", READ,true,""),
    ROOM_PRICE_DELETE(ROOM, "price:delete", "supprimer un price de chambre", DELETE,true,""),

    // RESERVATIONS
    RESERVATION_CREATE(RESERVATION, "reservation:create", "Créer une réservation", CREATE,true,""),
    RESERVATION_LIST(RESERVATION, "reservation:list", "lister les réservations", READ,true,""),
    RESERVATION_ONE(RESERVATION, "reservation:one", "charger une réservation", READ,true,""),
    RESERVATION_ACCEPT(RESERVATION, "reservation:accept", "accepter une réservation", MANAGE,true,""),
    RESERVATION_CANCEL(RESERVATION, "reservation:cancel", "annuler une réservation", MANAGE,true,""),
    RESERVATION_CLOSE(RESERVATION, "reservation:close", "cloturer une réservation", MANAGE,true,""),
    RESERVATION_DELETE(RESERVATION, "reservation:delete", "supprimer une réservation", DELETE,true,""),

    //HOUSE KEEPING
    HOUSE_KEEPING_AGENT_CREATE(HOUSE_KEEPING, "agent:create", "Créer un agent", CREATE,true,""),
    HOUSE_KEEPING_AGENT_UPDATE(HOUSE_KEEPING, "agent:update", "modifier un agent", UPDATE,true,""),
    HOUSE_KEEPING_AGENT_LIST(HOUSE_KEEPING, "agent:list", "lister les agents", READ,true,""),
    HOUSE_KEEPING_AGENT_DELETE(HOUSE_KEEPING, "agent:delete", "Supprimer un agent", DELETE,true,""),



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
