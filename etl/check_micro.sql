\pset footer off
-- identity columns
SELECT table_name, column_name, identity_generation
FROM information_schema.columns WHERE table_schema='public' AND is_identity='YES';

-- sequences encore definies ?
SELECT sequencename, last_value FROM pg_sequences WHERE schemaname='public' ORDER BY 1;

-- FK referentiels : valeurs utilisees vs tables parentes
SELECT 'room.pavillon cites' AS q, string_agg(DISTINCT c09, ',') FROM imp.app_room WHERE c09 <> '';
SELECT 'room.room_type cites' AS q, string_agg(DISTINCT c10, ',') FROM imp.app_room WHERE c10 <> '';
SELECT 'person.grades cites' AS q, string_agg(DISTINCT c03, ',') FROM imp.app_person;
SELECT 'room_price.room_type cites' AS q, string_agg(DISTINCT c04, ',') FROM imp.app_room_price WHERE c04 <> '';
SELECT 'meal_price.meal_type cites' AS q, string_agg(DISTINCT c02, ',') FROM imp.app_meal_price;

-- unicites
SELECT 'invoice.nums distincts' AS q, count(DISTINCT c17) FROM imp.app_invoice;
SELECT 'users distincts' AS q, count(DISTINCT c07) FROM imp.app_user;
SELECT 'roles distincts' AS q, count(DISTINCT c06) FROM imp.app_role;
SELECT 'perm distinctes' AS q, count(DISTINCT c04) FROM imp.pem;

-- reservations : room vide ?
SELECT 'res room vide' AS q, count(*) FROM imp.app_reservation WHERE c05 = '' OR c05 IS NULL;
-- prestations : type vide ?
SELECT 'prest type vide' AS q, count(*) FROM imp.app_prestation WHERE c13 = '' OR c13 IS NULL;
-- person : matricule G241304 en doublon (2) -> ids distincts
SELECT 'AICHA dup ids' AS q, string_agg(c08, ',') FROM imp.app_person WHERE c09='G241304';
-- user_rooms : users utilises
SELECT 'user_rooms resources' AS q, string_agg(DISTINCT c02, ',') FROM imp.app_user_rooms;
-- validated_room : range des anciens ids de salle
SELECT 'validated rooms min/max' AS q, min(c04::int), max(c04::int) FROM imp.app_validated_room;
-- invoice prise_en_charge : valeurs
SELECT 'invoice pec' AS q, c19, count(*) FROM imp.app_invoice GROUP BY c19;
-- incent détails : combien d'invoices ont c07 vide?
SELECT 'invoice c07 vide' AS q, count(*) FROM imp.app_invoice WHERE c07='' OR c07 IS NULL;