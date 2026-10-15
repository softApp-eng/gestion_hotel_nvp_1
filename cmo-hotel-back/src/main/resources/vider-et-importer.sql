-- ============================================================================
--  VIDER + IMPORTER : remplace TOUTES les donnees de la base NOUVELLE
--  par les donnees de l'ANCIENNE base (fichier data-prod.sql uploade)
-- ============================================================================
--  ATTENTION : ce script SUPPRIME toutes les donnees de la base ou il
--  est execute (personnes, reservations, factures, utilisateurs...).
--  A executer dans pgAdmin (Query Tool) sur la base NOUVELLE uniquement.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) VIDER TOUTES LES TABLES DE LA BASE NOUVELLE
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 2) REINITIALISER TOUTES LES SEQUENCES
-- ---------------------------------------------------------------------------
ALTER SEQUENCE "seq-app-config"     RESTART WITH 1;
ALTER SEQUENCE "seq-grade"          RESTART WITH 1;
ALTER SEQUENCE "seq-pavillon"       RESTART WITH 1;
ALTER SEQUENCE "seq-room-type"      RESTART WITH 1;
ALTER SEQUENCE "seq-room-price"     RESTART WITH 1;
ALTER SEQUENCE "seq-room"           RESTART WITH 1;
ALTER SEQUENCE "meal_type_seq"      RESTART WITH 1;
ALTER SEQUENCE "meal_price_seq"     RESTART WITH 1;
ALTER SEQUENCE "seq-res-details"    RESTART WITH 1;
ALTER SEQUENCE "seq-switched-room"  RESTART WITH 1;
ALTER SEQUENCE "seq-inv-guest"      RESTART WITH 1;
ALTER SEQUENCE "seq-inv-prestation" RESTART WITH 1;
ALTER SEQUENCE "seq-token"          RESTART WITH 1;
ALTER SEQUENCE "seq-resources"      RESTART WITH 1;
ALTER SEQUENCE "invoice_details_seq" RESTART WITH 1;
ALTER SEQUENCE "invoice_room_seq"   RESTART WITH 1;

-- ---------------------------------------------------------------------------
-- 3) IMPORTER LES DONNEES DE L'ANCIENNE BASE (data-prod.sql)
-- ---------------------------------------------------------------------------
-- GRADES
INSERT INTO grade (id, code, name, rating, category) VALUES (1,'GENA','GENERAL DARMEE',1,'OFFICIERS_GENERAUX');
INSERT INTO grade (id, code, name, rating, category) VALUES (2,'GENC','GENERAL DE CORPS DARMEE',2,'OFFICIERS_GENERAUX');
INSERT INTO grade (id, code, name, rating, category) VALUES (3,'GEND','GENERAL DE DIVISION',3,'OFFICIERS_GENERAUX');
INSERT INTO grade (id, code, name, rating, category) VALUES (4,'GENB','GENERAL DE BRIGADE',4,'OFFICIERS_GENERAUX');
INSERT INTO grade (id, code, name, rating, category) VALUES (5,'COLM','COLONEL-MAJOR',5,'OFFICIERS_GENERAUX');
INSERT INTO grade (id, code, name, rating, category) VALUES (6,'COL','COLONEL',6,'OFFICIER_SUPERIEUR');
INSERT INTO grade (id, code, name, rating, category) VALUES (7,'LCOL','LT-COLONEL',7,'OFFICIER_SUPERIEUR');
INSERT INTO grade (id, code, name, rating, category) VALUES (8,'CDT','COMMANDANT',8,'OFFICIER_SUPERIEUR');
INSERT INTO grade (id, code, name, rating, category) VALUES (9,'CNE','CAPITAINE',9,'OFFICIER_SUBALTERNE');
INSERT INTO grade (id, code, name, rating, category) VALUES (10,'LT','LIEUTENANT',10,'OFFICIER_SUBALTERNE');
INSERT INTO grade (id, code, name, rating, category) VALUES (11,'S/LT','S/LIEUTENANT',11,'OFFICIER_SUBALTERNE');
INSERT INTO grade (id, code, name, rating, category) VALUES (12,'ASP','ASPIRANT',12,'OFFICIER_SUBALTERNE');
INSERT INTO grade (id, code, name, rating, category) VALUES (18,'civil','CIVIL',18,'CIVIL');

-- PAVILLONS
INSERT INTO pavillon (id, email, name, phone_number, stars_number) VALUES (1,'oudayapav@gmail.com','OUDAYA','0610203040',5);
INSERT INTO pavillon (id, email, name, phone_number, stars_number) VALUES (2,'chellahpav@gmail.com','CHELLAH','0610203040',4);

-- TYPES DE CHAMBRE
INSERT INTO room_type (id,type,description) VALUES (1,'Suite','Chambre spacieuse et luxueuse avec chambre séparée et salon, offrant un confort élevé et des équipements modernes. Idéale pour un séjour premium.');
INSERT INTO room_type (id,type,description) VALUES (2,'Mini Suite','Chambre confortable avec un petit salon et un espace nuit, offrant plus d''espace et de confort qu''une chambre standard. Idéale pour un séjour agréable.');
INSERT INTO room_type (id,type,description) VALUES (3,'Chambre Simple','Chambre pratique et confortable, équipée d''un lit simple et des équipements essentiels, idéale pour un séjour individuel.');
INSERT INTO room_type (id,type,description) VALUES (4,'Suite Senior','Suite élégante et spacieuse avec salon et chambre séparée, offrant un haut niveau de confort et des équipements premium pour un séjour de luxe.');
INSERT INTO room_type (id,type,description) VALUES (5,'Suite Junior','Suite moderne avec espace nuit et coin salon ouvert, offrant plus de confort et d''espace qu''une chambre classique, idéale pour un séjour premium.');
INSERT INTO room_type (id,type,description) VALUES (6,'Chambre de luxe','Chambre élégante et raffinée, offrant un haut niveau de confort avec des équipements modernes pour un séjour agréable et prestigieux.');

-- TARIFS CHAMBRES
INSERT INTO room_price (id, room_type_id, category, price) VALUES (1,1,'OFFICIERS_GENERAUX',400);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (2,1,'OFFICIER_SUPERIEUR',300);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (3,1,'OFFICIER_SUBALTERNE',250);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (4,1,'CIVIL',450);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (5,2,'OFFICIERS_GENERAUX',300);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (6,2,'OFFICIER_SUPERIEUR',250);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (7,2,'OFFICIER_SUBALTERNE',200);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (8,2,'CIVIL',400);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (9,3,'OFFICIERS_GENERAUX',250);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (10,3,'OFFICIER_SUPERIEUR',200);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (11,3,'OFFICIER_SUBALTERNE',160);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (12,3,'CIVIL',300);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (13,4,'OFFICIERS_GENERAUX',800);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (14,4,'OFFICIER_SUPERIEUR',600);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (15,4,'CIVIL',800);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (16,5,'OFFICIERS_GENERAUX',600);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (17,5,'OFFICIER_SUPERIEUR',500);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (18,5,'CIVIL',700);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (19,6,'OFFICIERS_GENERAUX',450);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (20,6,'OFFICIER_SUPERIEUR',300);
INSERT INTO room_price (id, room_type_id, category, price) VALUES (21,6,'CIVIL',500);

-- CHAMBRES
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (1,1,4,'SS1','desc1','SS1','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (2,1,4,'SS2','desc1','SS2','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (3,1,4,'SS3','desc1','SS3','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (4,1,5,'SJ1','desc1','SJ1','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (5,1,5,'SJ2','desc1','SJ2','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (6,1,5,'SJ3','desc1','SJ3','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (7,1,6,'CL1','desc1','CL1','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (8,1,6,'CL2','desc1','CL2','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (9,2,1,'S1','desc2','S1','1',true,2,false,true,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (10,2,1,'S2','desc2','S2','1',true,2,false,true,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (11,2,1,'S3','desc2','S3','1',true,2,false,true,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (12,2,1,'S4','desc2','S4','1',true,2,false,true,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (13,2,2,'MS1','desc2','MS1','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (14,2,2,'MS2','desc2','MS2','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (15,2,3,'CS1','desc2','CS1','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (16,2,3,'CS2','desc2','CS2','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (17,2,3,'CS3','desc2','CS3','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (18,2,3,'CS4','desc2','CS4','2',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (19,2,3,'CS5','desc2','CS5','1',true,2,false,false,true);
INSERT INTO room (id, pavillon_id, room_type_id, code, description, name, floor, clean, capacity, archived, shared, available) VALUES (20,2,3,'CS6','desc2','CS6','1',true,2,false,false,true);

-- TYPES DE REPAS
INSERT INTO meal_type (id, name, description) VALUES (1, 'Petit déjeuner', 'Repas servi avant midi.');
INSERT INTO meal_type (id, name, description) VALUES (2, 'Déjeuner', 'Repas servi à midi.');
INSERT INTO meal_type (id, name, description) VALUES (3, 'Dîner', 'Repas servi le soir.');

-- TARIFS REPAS
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (1,1,'OFFICIERS_GENERAUX',40);
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (2,1,'OFFICIER_SUPERIEUR',30);
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (3,1,'CIVIL',20);
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (4,2,'OFFICIERS_GENERAUX',80);
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (5,2,'OFFICIER_SUPERIEUR',60);
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (6,2,'CIVIL',50);
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (7,3,'OFFICIERS_GENERAUX',80);
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (8,3,'OFFICIER_SUPERIEUR',60);
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (9,3,'CIVIL',50);

-- ---------------------------------------------------------------------------
-- 4) REAJUSTER LES SEQUENCES AUX VALEURS IMPORTER
-- ---------------------------------------------------------------------------
SELECT setval('public."seq-grade"',     (SELECT MAX(id) FROM grade));
SELECT setval('public."seq-pavillon"',  (SELECT MAX(id) FROM pavillon));
SELECT setval('public."seq-room-type"', (SELECT MAX(id) FROM room_type));
SELECT setval('public."seq-room-price"',(SELECT MAX(id) FROM room_price));
SELECT setval('public."seq-room"',      (SELECT MAX(id) FROM room));
SELECT setval('meal_type_seq',          (SELECT MAX(id) FROM meal_type));
SELECT setval('meal_price_seq',         (SELECT MAX(id) FROM meal_price));

COMMIT;

-- ============================================================================
-- VERIFICATION : vous devez voir vos chiffres reels, ex :
--   grade=13, pavillon=2, room_type=6, room_price=21, room=20, meal_type=3, meal_price=9
-- ============================================================================
SELECT 'grade' AS table_name, COUNT(*) FROM grade
UNION ALL SELECT 'pavillon',   COUNT(*) FROM pavillon
UNION ALL SELECT 'room_type',  COUNT(*) FROM room_type
UNION ALL SELECT 'room_price', COUNT(*) FROM room_price
UNION ALL SELECT 'room',       COUNT(*) FROM room
UNION ALL SELECT 'meal_type',  COUNT(*) FROM meal_type
UNION ALL SELECT 'meal_price', COUNT(*) FROM meal_price;