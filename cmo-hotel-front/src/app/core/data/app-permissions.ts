export const APP_PERMISSIONS = {
    // default
    DEFAULT:'general:default',
    // users
    ADMIN_USERS_LIST:'users:user:list',
    ADMIN_USERS_CREATE:'users:user:create',
    ADMIN_USERS_UPDATE:'users:user:update',
    ADMIN_USERS_PASSWORD_MODIFY:'users:user:password:modify',
    ADMIN_USERS_ASSIGN_ROLES:'users:user:assign:roles',
    ADMIN_AUDIT_ACTIVITY_LOGS:'audits:logs:filter',

    // roles
    ADMIN_ROLES_LIST:'roles:role:list',
    ADMIN_ROLES_PERMISSIONS_LIST:'roles:permission:list',
    ADMIN_ROLES_CREATE:'roles:role:create',
    ADMIN_ROLES_UPDATE:'roles:role:update',
    ADMIN_ROLES_ONE:'roles:role:one',
    ADMIN_ROLES_DELETE:'roles:role:delete',
    ADMIN_ROLES_CLONE:'roles:role:clone',

    // PERSON
    PERSON_CREATE:'persons:person:create',
    PERSON_UPDATE:'persons:person:update',
    PERSON_LIST:'persons:person:list',
    PERSON_SELECT_ONE:'persons:person:one',
    PERSON_DELETE:'persons:person:delete',

    // PAVILLON
    PAVILLON_CREATE:'pavillons:pavillon:create',
    PAVILLON_UPDATE:'pavillons:pavillon:update',
    PAVILLON_LIST:'pavillons:pavillon:list',
    PAVILLON_SELECT_ONE:'pavillons:pavillon:one',

    // ROOM
    ROOM_CREATE:'rooms:room:create',
    ROOM_UPDATE:'rooms:room:update',
    ROOM_LIST:'rooms:room:list',
    ROOM_SELECT_ONE:'rooms:room:one',

    // ROOM TYPES
    ROOM_TYPE_CREATE:'rooms:type:create',
    ROOM_TYPE_UPDATE:'rooms:type:update',
    ROOM_TYPE_LIST:'rooms:type:list',
    ROOM_TYPE_SELECT_ONE:'rooms:type:one',
    ROOM_TYPE_DELETE:'rooms:type:delete',

    // ROOM PRICES
    ROOM_PRICE_CREATE:'rooms:price:create',
    ROOM_PRICE_UPDATE:'rooms:price:update',
    ROOM_PRICE_LIST:'rooms:price:list',
    ROOM_PRICE_SELECT_ONE:'rooms:price:one',
    ROOM_PRICE_DELETE:'rooms:price:delete',

    // RESERVATION
    RESERVATION_CREATE:'reservations:reservation:create',
    RESERVATION_LIST:'reservations:reservation:list',
    RESERVATION_ACCEPT:'reservations:reservation:accept',
    RESERVATION_CLOSE:'reservations:reservation:close',
    RESERVATION_CANCEL:'reservations:reservation:cancel',
    RESERVATION_DELETE:'reservations:reservation:delete',

}
