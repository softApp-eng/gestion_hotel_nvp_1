\pset footer off
SELECT 'premi doublons' AS q, count(*) FROM (SELECT c01,c02,count(*) n FROM imp.app_premi GROUP BY c01,c02 HAVING count(*)>1) x;
SELECT 'user_roles doublons' AS q, count(*) FROM (SELECT c01,c02,count(*) n FROM imp.app_user_roles GROUP BY c01,c02 HAVING count(*)>1) x;
SELECT 'user_rooms doublons' AS q, count(*) FROM (SELECT c01,c02,count(*) n FROM imp.app_user_rooms GROUP BY c01,c02 HAVING count(*)>1) x;
SELECT 'room ids dup' AS q, count(*) FROM (SELECT c16,count(*) n FROM imp.app_room GROUP BY c16 HAVING count(*)>1) x;
SELECT 'room_price ids dup' AS q, count(*) FROM (SELECT c03,count(*) n FROM imp.app_room_price GROUP BY c03 HAVING count(*)>1) x;
SELECT 'meal_price ids dup' AS q, count(*) FROM (SELECT c03,count(*) n FROM imp.app_meal_price GROUP BY c03 HAVING count(*)>1) x;
SELECT 'grade ids dup' AS q, count(*) FROM (SELECT c02,count(*) n FROM imp.app_grade GROUP BY c02 HAVING count(*)>1) x;
SELECT 'person ids dup' AS q, count(*) FROM (SELECT c08,count(*) n FROM imp.app_person GROUP BY c08 HAVING count(*)>1) x;
SELECT 'prestation ids dup' AS q, count(*) FROM (SELECT c08,count(*) n FROM imp.app_prestation GROUP BY c08 HAVING count(*)>1) x;
SELECT 'validated ids dup' AS q, count(*) FROM (SELECT c07,count(*) n FROM imp.app_validated_room GROUP BY c07 HAVING count(*)>1) x;
SELECT 'guest ids dup' AS q, count(*) FROM (SELECT c01,count(*) n FROM imp.app_guest GROUP BY c01 HAVING count(*)>1) x;
SELECT 'details ids dup' AS q, count(*) FROM (SELECT c01,count(*) n FROM imp.app_details GROUP BY c01 HAVING count(*)>1) x;
SELECT 'det codes dup' AS q, count(*) FROM (SELECT c04,count(*) n FROM imp.app_reservation_det GROUP BY c04 HAVING count(*)>1) x;
SELECT 'agent ids dup' AS q, count(*) FROM (SELECT c02,count(*) n FROM imp.app_house_agent GROUP BY c02 HAVING count(*)>1) x;
SELECT 'history ids dup' AS q, count(*) FROM (SELECT c01,count(*) n FROM imp.app_house_history GROUP BY c01 HAVING count(*)>1) x;
SELECT 'role ids dup' AS q, count(*) FROM (SELECT c06,count(*) n FROM imp.app_role GROUP BY c06 HAVING count(*)>1) x;
SELECT 'perm ids dup' AS q, count(*) FROM (SELECT c04,count(*) n FROM imp.pem GROUP BY c04 HAVING count(*)>1) x;
SELECT 'user ids dup' AS q, count(*) FROM (SELECT c07,count(*) n FROM imp.app_user GROUP BY c07 HAVING count(*)>1) x;