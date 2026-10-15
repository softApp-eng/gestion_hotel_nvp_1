\pset footer off
-- A. unicite c09 / c11 dans reservation
SELECT 'c09 distincts' AS q, count(DISTINCT c09) FROM imp.app_reservation;
SELECT 'c11 distincts' AS q, count(DISTINCT c11) FROM imp.app_reservation;
SELECT 'c09 vides' AS q, count(*) FROM imp.app_reservation WHERE c09 = '' OR c09 IS NULL;
SELECT 'c11 vides' AS q, count(*) FROM imp.app_reservation WHERE c11 = '' OR c11 IS NULL;
SELECT 'c08 vides' AS q, count(*) FROM imp.app_reservation WHERE c08 = '' OR c08 IS NULL;

-- B. prestation c12 : contenu dans reservation c09 ou c11 ?
SELECT 'prest c12 in res.c09' AS q, count(*) FROM imp.app_prestation p
WHERE NOT EXISTS (SELECT 1 FROM imp.app_reservation r WHERE r.c09 = p.c12);
SELECT 'prest c12 in res.c11' AS q, count(*) FROM imp.app_prestation p
WHERE NOT EXISTS (SELECT 1 FROM imp.app_reservation r WHERE r.c11 = p.c12);

-- C. chevauchement des uuid : reservation c09/c11 vs guests person ids vs person ids
SELECT 'res.c09 in person ids' AS q, count(*) FROM imp.app_reservation r
WHERE NOT EXISTS (SELECT 1 FROM imp.app_person p WHERE p.c08 = r.c09);
SELECT 'res.c11 in person ids' AS q, count(*) FROM imp.app_reservation r
WHERE NOT EXISTS (SELECT 1 FROM imp.app_person p WHERE p.c08 = r.c11);
SELECT 'res.c09 in guest person ids' AS q, count(*) FROM imp.app_reservation r
WHERE NOT EXISTS (SELECT 1 FROM imp.app_guest g WHERE g.c09 = r.c09);
SELECT 'res.c11 in guest person ids' AS q, count(*) FROM imp.app_reservation r
WHERE NOT EXISTS (SELECT 1 FROM imp.app_guest g WHERE g.c09 = r.c11);

-- D. echantillon : les personnes de la reservation existent-elles avec un matricule joint ?
SELECT 'pers id 95458e83' AS q, count(*) FROM imp.app_person WHERE c08 = '95458e83-5244-4d64-b248-817f4015c511';
SELECT 'matricule G241304 (AICHA)' AS q, count(*) FROM imp.app_person WHERE c09 = 'G241304';

-- E. c09 de reservation : meme famille que ids de personnes (ex 1ere ligne de chaque)
SELECT 'pers id sample' AS q, c08 FROM imp.app_person LIMIT 1;
SELECT 'res c09 sample' AS q, c09 FROM imp.app_reservation LIMIT 1;

-- F. Quand la reservation future : reservation c09 sera l'id. Verifier doublons c09
SELECT 'c09 doublons' AS q, count(*) FROM (SELECT c09, count(*) n FROM imp.app_reservation GROUP BY c09 HAVING count(*) > 1) x;

-- G. invoice c10 '656' : c'est quoi vs det code?
SELECT 'invoice.c10 in det codes' AS q, count(*) FROM imp.app_invoice i
WHERE i.c10 <> '' AND NOT EXISTS (SELECT 1 FROM imp.app_reservation_det d WHERE d.c04 = i.c10);
SELECT 'invoice.c10 vide' AS q, count(*) FROM imp.app_invoice WHERE c10 = '' OR c10 IS NULL;