\pset footer off
-- Où se trouve 7ab20091 (ref prestation) dans app_reservation ?
SELECT '7ab20091 dans reservation, ligne:' AS q, c01,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13
FROM imp.app_reservation WHERE c09 LIKE '7ab20091%' OR c11 LIKE '7ab20091%';

-- 95458e83 (c09 reservation) existe dans person ?
SELECT 'person contient 95458e83 ?' AS q, count(*) FROM imp.app_person WHERE c08 = '95458e83-5244-4d64-b248-817f4015c511';

-- Varie-t-on la comparaison : person_id de reservation vs person.UN champ ?
SELECT 'reservation ids (c11) dans person c08 ?' AS q, count(*) FROM imp.app_reservation r
WHERE NOT EXISTS (SELECT 1 FROM imp.app_person p WHERE p.c08 = r.c11);

-- intersection aller-retour : reservation c11 a-t-il une forme UUID typique ?
SELECT 'exemples reservation c11' AS q, c11 FROM imp.app_reservation LIMIT 3;

-- Roles actuels (feeder) pour comparer semantique name/title
SELECT id, name, title, is_system FROM app_role ORDER BY name;

-- Permissions actuelles (feeder) : 3 exemples
SELECT name, module, groupe, title, affectable FROM app_permission LIMIT 6;

-- Verifier que les 86 noms pem == 86 noms actuels ?
SELECT 'perm noms egaux?' AS q,
  (SELECT count(*) FROM app_permission) AS actuelles,
  (SELECT count(DISTINCT c06) FROM imp.pem) AS anciennes;