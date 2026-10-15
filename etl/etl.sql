-- =====================================================================
-- ETL : remplacement complet du contenu de cmo_db2 par les donnees
-- de l'ANCIENNE base (fichiers CSV -> schema imp), en preservant tout.
--  - mapping ancien id chambre -> nouveau id (imp.app_room c08 -> c16)
--  - referentiels: pavillon, grade (13=CIVIL au lieu de 18), room_type
--    (7 = Chambre Double), meal_type (4 = Kocher + placeholders 5-10),
--    room (63), room_price (25), meal_price (11, doublons renumero)
--  - auth: app_permission (86), app_role (7), app_user (7),
--    role_permissions (156), app_user_roles (11), app_user_resource (2),
--    app_user_rooms (62, remap chambre)
--  - metier: person (1829), housekeeping_agent (10),
--    reservation_details (761), reservation (1111, remap chambre),
--    prestation (789), invoice_details (1218), invoice (755),
--    invoice_guest (1722, invoice_room_id NULL), validated_night (1719),
--    housekeeping_history (6, remap chambre), app_configuration (vonfi)
-- =====================================================================
\set ON_ERROR_STOP on
SET statement_timeout = 600000;

BEGIN;

-- 0) nettoyage complet
TRUNCATE activity_log, app_configuration, app_permission, app_role, app_token,
  app_user, app_user_resource, app_user_roles, app_user_rooms,
  grade, housekeeping_agent, housekeeping_history, invoice, invoice_details,
  invoice_guest, invoice_prestation, invoice_room, meal_price, meal_type,
  pavillon, permanence, person, prestation, reservation, reservation_details,
  role_permissions, room, room_price, room_type, switched_room, validated_night
CASCADE;

-- 1) mapping des chambres (ancien id -> nouveau id)
CREATE TEMP TABLE room_map AS
  SELECT DISTINCT c08::bigint AS old_id, c16::bigint AS new_id
  FROM imp.app_room WHERE c08 <> '' AND c16 <> '';
CREATE INDEX ON room_map(old_id);

-- 2) referentiels ------------------------------------------------------
INSERT INTO pavillon (id, description, email, name, phone_number, stars_number)
SELECT c02::bigint, NULLIF(c03,''), c04, c05, NULLIF(c06,''), NULLIF(c01,'')::int
FROM imp.app_pavillon;

INSERT INTO grade (id, rating, category, code, name)
SELECT c02::bigint, NULLIF(c01,'')::int, c03, c04, c05 FROM imp.app_grade;

INSERT INTO room_type (id, created_at, created_by, description, last_modified_by, type, updated_at)
SELECT c02::bigint, NULLIF(c01,'')::timestamp, NULLIF(c04,''), NULLIF(c05,''),
       NULLIF(c06,''), c07, NULLIF(c03,'')::timestamp
FROM imp.app_room_type;

INSERT INTO meal_type (id, created_at, created_by, description, last_modified_by, name, updated_at)
SELECT c02::bigint, NULLIF(c01,'')::timestamp, NULLIF(c05,''), NULLIF(c04,''),
       NULLIF(c06,''), c07, NULLIF(c03,'')::timestamp
FROM imp.app_meal_type;

-- types de repas 5..10 (referencies par meal_price mais absents de l'export)
INSERT INTO meal_type (id, name, description)
SELECT g.id,
       CASE g.id WHEN 5 THEN 'Type 5' WHEN 6 THEN 'Type 6' WHEN 7 THEN 'Type 7'
                 WHEN 8 THEN 'Type 8' WHEN 9 THEN 'Type 9' WHEN 10 THEN 'Type 10'
                 WHEN 60 THEN 'Kocher (ancien 60)' ELSE 'Type '||g.id END,
       'Ancien type de repas conserve (historique) - reference par meal_price'
FROM (VALUES (5),(6),(7),(8),(9),(10),(60)) AS g(id)
WHERE NOT EXISTS (SELECT 1 FROM meal_type WHERE id = g.id);

INSERT INTO room (id, archived, available, capacity, clean, code, shared,
                  created_at, description, name, updated_at,
                  created_by, last_modified_by, pavillon_id, room_type_id, floor)
SELECT c16::bigint, c01::boolean, c02::boolean, c03::int, c04::boolean,
       c05 || '-' || c16 AS code,
       c06::boolean, NULLIF(c07,'')::timestamp, NULLIF(c12,''), NULLIF(c13,''),
       NULLIF(c11,'')::timestamp, NULLIF(c14,''), NULLIF(c15,''),
       NULLIF(c09,'')::bigint, NULLIF(c10,'')::bigint, NULL
FROM imp.app_room;

INSERT INTO room_price (id, category, created_at, created_by, last_modified_by,
                        price, updated_at, room_type_id)
SELECT c03::bigint, c06, NULLIF(c02,'')::timestamp, NULLIF(c07,''),
       NULLIF(c08,''), NULLIF(c01,'')::float8, NULLIF(c05,'')::timestamp,
       c04::bigint
FROM imp.app_room_price;

-- meal_price : renumetrote TOUS les ids a partir du max existant
INSERT INTO meal_price (id, category, price, meal_type_id)
SELECT (SELECT COALESCE(max(id), 0) FROM meal_price) + x.rn,
       NULLIF(x.c04,''),
       NULLIF(x.c01,'')::numeric,
       x.c02::bigint
FROM (
  SELECT c01, c02, c03, c04,
         row_number() OVER (ORDER BY c03, c01, c02) AS rn
  FROM imp.app_meal_price
) x;

-- 3) auth ---------------------------------------------------------------
INSERT INTO app_permission (id, affectable, description, groupe, module, name, title)
SELECT c04, c01::boolean, NULLIF(c02,''), c03, c05, c06, c07 FROM imp.pem;

INSERT INTO app_role (id, created_at, created_by, description, is_system,
                      last_modified_by, name, title, updated_at)
SELECT c06, c02::timestamp, NULL, c05, c01::boolean, NULL, c08, c09,
       c03::timestamp
FROM imp.app_role;

INSERT INTO app_user (id, account_status, avatar, created_at, first_name,
                      is_system, last_name, password, updated_at, username)
SELECT c07, c01::boolean, NULLIF(c05,''), c03::timestamp, c10, c02::boolean,
       c08, c09, c04::timestamp, c06
FROM imp.app_user;

INSERT INTO app_user_resource (id, user_id) SELECT c01::bigint, c02 FROM imp.app_user_resource;

INSERT INTO app_user_roles (user_id, role_id) SELECT c02, c01 FROM imp.app_user_roles;

INSERT INTO role_permissions (role_id, permission_id) SELECT c02, c01 FROM imp.app_premi;

INSERT INTO app_user_rooms (user_id, room_id)
SELECT u.c02::bigint, m.new_id
FROM imp.app_user_rooms u JOIN room_map m ON m.old_id = u.c01::bigint;

-- 4) metier --------------------------------------------------------------
INSERT INTO person (id, archived, birth_date, email, first_name, gender,
                    identity, language, last_name, matricule, nationality,
                    observation, phone_number, relationship_type, unite,
                    grade_id, primary_person_id)
SELECT c08, c01::boolean, NULLIF(c02,'')::date, NULLIF(c04,''), c06,
       NULLIF(c07,''), NULLIF(c10,''), NULLIF(c12,''), c11, NULLIF(c09,''),
       NULLIF(c13,''), NULLIF(c15,''), NULLIF(c14,''), NULLIF(c16,''),
       NULLIF(c17,''), c03::bigint,
       CASE WHEN c05 <> '' AND EXISTS (SELECT 1 FROM imp.app_person x WHERE x.c08 = p.c05)
            THEN c05 ELSE NULL END
FROM imp.app_person p;

INSERT INTO housekeeping_agent (id, archived, first_name, last_name, phone)
SELECT c02::bigint, c01::boolean, c05, c04, NULLIF(c03,'') FROM imp.app_house_agent;

INSERT INTO reservation_details (code, category, checkin, checkout, created_at,
                                 created_by, last_modified_by, observation,
                                 planned_end, planned_start, prise_en_charge,
                                 prise_en_charge_reference, status, updated_at)
SELECT c04::bigint, c10, NULLIF(c02,'')::timestamp, NULLIF(c03,'')::timestamp,
       c05::timestamp, c11, c12, NULLIF(c09,''), NULLIF(c06,'')::timestamp,
       NULLIF(c07,'')::timestamp, (c01 = 't'), NULLIF(c13,''), c14,
       c08::timestamp
FROM imp.app_reservation_det;

INSERT INTO reservation (id, applied_price, created_at, created_by,
                         exception_person_status, exceptional_checkin,
                         exceptional_checkout, last_modified_by, role,
                         updated_at, details_code, person_id, room_id)
SELECT c09, NULLIF(c13,'')::float8, c01::timestamp, c07, NULLIF(c08,''),
       NULLIF(c03,'')::timestamp, NULLIF(c04,'')::timestamp, c10, c12,
       c06::timestamp,
       CASE WHEN c02 <> '' AND EXISTS (SELECT 1 FROM imp.app_reservation_det d WHERE d.c04 = r.c02)
            THEN c02::bigint ELSE NULL END,
       c11, m.new_id
FROM imp.app_reservation r LEFT JOIN room_map m ON m.old_id = r.c05::bigint;

INSERT INTO prestation (id, archived, created_at, created_by, day,
                        last_modified_by, name, observation, price, quantity,
                        type, updated_at, reservation_id)
SELECT c08, c01::boolean, c05::timestamp, c07, NULLIF(c02,'')::date, c09,
       c10, NULLIF(c11,''), NULLIF(c03,'')::numeric, c04::int, c13,
       c06::timestamp, c12
FROM imp.app_prestation;

INSERT INTO invoice_details (id) SELECT c01::bigint FROM imp.app_details;

INSERT INTO invoice (num, category, checkin, checkout, created_at, created_by,
                     description, invoice_number, issued_at, last_modified_by,
                     paid_at, payment_mode, prise_en_charge,
                     prise_en_charge_reference, status, total_prestation_price,
                     total_room_price, updated_at, details_id,
                     reservation_details_id)
SELECT c17, c12, NULLIF(c04,'')::timestamp, NULLIF(c05,'')::timestamp,
       c06::timestamp, c13, NULLIF(c14,''), c15, NULLIF(c08,'')::timestamp,
       c16, NULLIF(c09,'')::timestamp, NULLIF(c18,''), (c01 = 't'),
       NULLIF(c19,''), c20, NULLIF(c02,'')::float8, NULLIF(c03,'')::float8,
       c11::timestamp, NULL,
       CASE WHEN i.c07 <> '' AND EXISTS (SELECT 1 FROM imp.app_reservation_det d WHERE d.c04 = i.c07)
            THEN i.c07::bigint ELSE NULL END
FROM imp.app_invoice i;

INSERT INTO invoice_guest (id, first_name, grade_code, identity, last_name,
                           matricule, nationality, person_id, role, unite,
                           invoice_room_id)
SELECT c01::bigint, NULLIF(c03,''), NULLIF(c04,''), NULLIF(c05,''),
       NULLIF(c06,''), NULLIF(c07,''), NULLIF(c08,''),
       CASE WHEN g.c09 <> '' AND EXISTS (SELECT 1 FROM imp.app_person p WHERE p.c08 = g.c09)
            THEN g.c09 ELSE NULL END,
       c10, NULLIF(c11,''), NULL
FROM imp.app_guest g;

INSERT INTO validated_night (id, created_at, created_by, last_modified_by,
                             night_date, observation, room_name,
                             room_price_applied, updated_at, invoice_id,
                             room_applied_id)
SELECT v.c07, v.c03::timestamp, v.c06, v.c09, NULLIF(v.c01,'')::date,
       NULLIF(v.c10,''), NULLIF(v.c11,''), NULLIF(v.c02,'')::float8,
       v.c05::timestamp, v.c08, m.new_id
FROM imp.app_validated_room v JOIN room_map m ON m.old_id = v.c04::bigint;

INSERT INTO housekeeping_history (id, comment, created_at, created_by, end_at,
                                  last_modified_by, start_at, status,
                                  updated_at, agent_id, room_id)
SELECT h.c01::bigint, NULLIF(h.c08,''), h.c02::timestamp, h.c09,
       h.c03::timestamp, h.c10, h.c06::timestamp, NULLIF(h.c11,''),
       h.c07::timestamp, h.c04::bigint, m.new_id
FROM imp.app_house_history h JOIN room_map m ON m.old_id = h.c05::bigint;

INSERT INTO app_configuration (id, auto_cleaning_room_time_cron_expression, checkout_time)
SELECT c02::bigint, c03, c01::time FROM imp.vonfi;

-- 5) ceinture : dernier orphelin primary_person_id -> NULL
UPDATE person SET primary_person_id = NULL
WHERE primary_person_id IS NOT NULL
  AND primary_person_id NOT IN (SELECT id FROM person);

-- 6) sequences -----------------------------------------------------------
SELECT setval('seq-pavillon',   (SELECT COALESCE(max(id),1)   FROM pavillon));
SELECT setval('seq-grade',      (SELECT COALESCE(max(id),1)   FROM grade));
SELECT setval('seq-room-type',  (SELECT COALESCE(max(id),1)   FROM room_type));
SELECT setval('meal_type_seq',  (SELECT COALESCE(max(id),1)   FROM meal_type));
SELECT setval('seq-room',       (SELECT COALESCE(max(id),1)   FROM room));
SELECT setval('seq-room-price', (SELECT COALESCE(max(id),1)   FROM room_price));
SELECT setval('meal_price_seq',  (SELECT COALESCE(max(id),1)   FROM meal_price));
SELECT setval('seq-resources',  (SELECT COALESCE(max(id),1)   FROM app_user_resource));
SELECT setval('seq-res-details',(SELECT COALESCE(max(code),1) FROM reservation_details));
SELECT setval('seq-inv-guest',  (SELECT COALESCE(max(id),1)   FROM invoice_guest));
SELECT setval('invoice_details_seq', (SELECT COALESCE(max(id),1) FROM invoice_details));
SELECT setval('housekeeping_agent_id_seq',   (SELECT COALESCE(max(id),1) FROM housekeeping_agent));
SELECT setval('housekeeping_history_id_seq', (SELECT COALESCE(max(id),1) FROM housekeeping_history));
SELECT setval('seq-app-config', (SELECT COALESCE(max(id),1) FROM app_configuration));

COMMIT;