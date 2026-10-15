\pset footer off
SELECT 'det c01 distinct' AS q, c01, count(*) FROM imp.app_reservation_det GROUP BY c01;
SELECT 'det c13 distinct' AS q, c13, count(*) FROM imp.app_reservation_det GROUP BY c13;
SELECT 'invoice c01 distinct' AS q, c01, count(*) FROM imp.app_invoice GROUP BY c01;
SELECT 'prestation c01 distinct' AS q, c01, count(*) FROM imp.app_prestation GROUP BY c01;
SELECT 'guest c09 vides' AS q, count(*) FROM imp.app_guest WHERE c09='' OR c09 IS NULL;
SELECT 'reserved det checkin vide' AS q, count(*) FROM imp.app_reservation_det WHERE c02='' OR c02 IS NULL;
SELECT 'reserved det checkout vide' AS q, count(*) FROM imp.app_reservation_det WHERE c03='' OR c03 IS NULL;
SELECT 'invoice checkin/checkout vides' AS q, count(*) FROM imp.app_invoice WHERE c04='' OR c04 IS NULL OR c05='' OR c05 IS NULL;
SELECT 'validated night_date vide' AS q, count(*) FROM imp.app_validated_room WHERE c01='' OR c01 IS NULL;