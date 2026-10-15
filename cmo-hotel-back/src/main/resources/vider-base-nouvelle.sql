-- ============================================================================
--  VIDER UNIQUEMENT : vide TOUTES les tables de la base NOUVELLE (schema garde)
--  A executer AVANT de restaurer les donnees de l'ancienne base.
--  NE PAS executer les INSERT de data-prod.sql avant la restauration
--  (sinon conflits de cles dupliquees).
-- ============================================================================

BEGIN;

TRUNCATE TABLE
    role_permissions,
    app_user_rooms,
    app_user_roles,
    app_user_resource,
    app_token,
    app_user,
    app_role,
    app_permission,
    permanence,
    housekeeping_history,
    housekeeping_agent,
    validated_night,
    invoice_prestation,
    invoice,
    invoice_guest,
    invoice_room,
    invoice_details,
    prestation,
    switched_room,
    reservation,
    reservation_details,
    person,
    meal_price,
    meal_type,
    room,
    room_price,
    room_type,
    pavillon,
    grade,
    app_configuration
CASCADE;

ALTER SEQUENCE "seq-app-config"      RESTART WITH 1;
ALTER SEQUENCE "seq-grade"           RESTART WITH 1;
ALTER SEQUENCE "seq-pavillon"        RESTART WITH 1;
ALTER SEQUENCE "seq-room-type"       RESTART WITH 1;
ALTER SEQUENCE "seq-room-price"      RESTART WITH 1;
ALTER SEQUENCE "seq-room"            RESTART WITH 1;
ALTER SEQUENCE "meal_type_seq"       RESTART WITH 1;
ALTER SEQUENCE "meal_price_seq"      RESTART WITH 1;
ALTER SEQUENCE "seq-res-details"     RESTART WITH 1;
ALTER SEQUENCE "seq-switched-room"   RESTART WITH 1;
ALTER SEQUENCE "seq-inv-guest"       RESTART WITH 1;
ALTER SEQUENCE "seq-inv-prestation"  RESTART WITH 1;
ALTER SEQUENCE "seq-token"           RESTART WITH 1;
ALTER SEQUENCE "seq-resources"       RESTART WITH 1;
ALTER SEQUENCE "invoice_details_seq" RESTART WITH 1;
ALTER SEQUENCE "invoice_room_seq"    RESTART WITH 1;

COMMIT;