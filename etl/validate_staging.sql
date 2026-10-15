-- ===== Validations referentielles sur staging =====
\pset footer off

-- 1) Roles : toutes les lignes (comparaison futur)
SELECT c01,c02,c03,c04,c05,c06,c07,c08,c09 FROM imp.app_role ORDER BY c06;

-- 2) Permissions : distincts affectable / module / groupe
SELECT 'modules' AS quoi, c05, count(*) FROM imp.pem GROUP BY c05 ORDER BY c05;
SELECT 'groupes' AS quoi, c03, count(*) FROM imp.pem GROUP BY c03 ORDER BY c03;

-- 3) Orphelins reservation.person_id
SELECT 'res.person_id manquants' AS verif, count(*) FROM imp.app_reservation r
WHERE r.c09 NOT IN (SELECT c08 FROM imp.app_person);

-- 4) Orphelins prestation.reservation_id
SELECT 'prestation.reservation manquants' AS verif, count(*) FROM imp.app_prestation p
WHERE NOT EXISTS (SELECT 1 FROM imp.app_reservation r WHERE r.c11 = p.c12);

-- 5) invoice reservation_details_id present dans codes det
SELECT 'invoice.details absent' AS verif, count(*) FROM imp.app_invoice i
WHERE i.c07 IS NOT NULL AND i.c07 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_reservation_det d WHERE d.c04 = i.c07);

-- 6) reservation.details_code present dans codes det
SELECT 'res.details_code absent' AS verif, count(*) FROM imp.app_reservation r
WHERE r.c02 IS NOT NULL AND r.c02 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_reservation_det d WHERE d.c04 = r.c02);

-- 7) validated_room.invoice_id dans invoice nums
SELECT 'validated.invoice absent' AS verif, count(*) FROM imp.app_validated_room v
WHERE v.c08 IS NOT NULL AND v.c08 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_invoice i WHERE i.c17 = v.c08);

-- 8) guest.person_id dans persons
SELECT 'guest.person absent' AS verif, count(*) FROM imp.app_guest g
WHERE g.c09 IS NOT NULL AND g.c09 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_person p WHERE p.c08 = g.c09);

-- 9) house_history agent_id dans agents
SELECT 'hh.agent absent' AS verif, count(*) FROM imp.app_house_history h
WHERE NOT EXISTS (SELECT 1 FROM imp.app_house_agent a WHERE a.c02 = h.c04);

-- 10) person.primary_person_id referentiels
SELECT 'person.primary absents' AS verif, count(*) FROM imp.app_person p
WHERE p.c05 IS NOT NULL AND p.c05 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_person p2 WHERE p2.c08 = p.c05);
SELECT 'person.primary non vides' AS verif, count(*) FROM imp.app_person p WHERE p.c05 IS NOT NULL AND p.c05 <> '';

-- 11) Champs vides critiques (NOT NULL cibles)
SELECT 'person.grade vide' AS verif, count(*) FROM imp.app_person WHERE c03 = '' OR c03 IS NULL;
SELECT 'person.archived vide' AS verif, count(*) FROM imp.app_person WHERE c01 = '' OR c01 IS NULL;
SELECT 'reservation.person_id vide' AS verif, count(*) FROM imp.app_reservation WHERE c09 = '' OR c09 IS NULL;
SELECT 'reservation.role vide' AS verif, count(*) FROM imp.app_reservation WHERE c12 = '' OR c12 IS NULL;
SELECT 'prestation.quantity vide' AS verif, count(*) FROM imp.app_prestation WHERE c04 = '' OR c04 IS NULL;
SELECT 'prestation.reservation vide' AS verif, count(*) FROM imp.app_prestation WHERE c12 = '' OR c12 IS NULL;
SELECT 'invoice.status vide' AS verif, count(*) FROM imp.app_invoice WHERE c20 = '' OR c20 IS NULL;
SELECT 'invoice.category vide' AS verif, count(*) FROM imp.app_invoice WHERE c12 = '' OR c12 IS NULL;
SELECT 'det.status vide' AS verif, count(*) FROM imp.app_reservation_det WHERE c14 = '' OR c14 IS NULL;
SELECT 'det.category vide' AS verif, count(*) FROM imp.app_reservation_det WHERE c10 = '' OR c10 IS NULL;
SELECT 'guest.role vide' AS verif, count(*) FROM imp.app_guest WHERE c10 = '' OR c10 IS NULL;
SELECT 'user.username vide' AS verif, count(*) FROM imp.app_user WHERE c06 = '' OR c06 IS NULL;
SELECT 'role.name vide' AS verif, count(*) FROM imp.app_role WHERE c04 = '' OR c04 IS NULL;

-- 12) mapping rooms : vieux ids references vs dispo
SELECT 'room_map' AS verif, count(*) AS n FROM (
  SELECT DISTINCT c08, c16 FROM imp.app_room WHERE c08 IS NOT NULL AND c08 <> '' AND c16 IS NOT NULL AND c16 <> ''
) m;
SELECT 'res.room_id non mappable' AS verif, count(*) FROM imp.app_reservation r
WHERE r.c05 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_room ro WHERE ro.c08 = r.c05);
SELECT 'validated.room non mappable' AS verif, count(*) FROM imp.app_validated_room v
WHERE v.c04 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_room ro WHERE ro.c08 = v.c04);
SELECT 'hh.room non mappable' AS verif, count(*) FROM imp.app_house_history h
WHERE h.c05 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_room ro WHERE ro.c08 = h.c05);
SELECT 'user_rooms.room non mappable' AS verif, count(*) FROM imp.app_user_rooms u
WHERE NOT EXISTS (SELECT 1 FROM imp.app_room ro WHERE ro.c08 = u.c01);

-- 13) cas particuliers : person matricule -21
SELECT 'person matricule -21' AS verif, count(*) FROM imp.app_person WHERE c09 = '-21';
-- codes det vides ou doublons ?
SELECT 'det.code vide' AS verif, count(*) FROM imp.app_reservation_det WHERE c04 = '' OR c04 IS NULL;
SELECT 'det.code doublons' AS verif, sum(n) FROM (SELECT c04, count(*) n FROM imp.app_reservation_det GROUP BY c04 HAVING count(*) > 1) x;