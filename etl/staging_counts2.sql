SELECT t AS table_staging, sum(n) AS lignes FROM (
  SELECT 'app_details' AS t, count(*) AS n FROM imp.app_details UNION ALL
  SELECT 'app_grade' AS t, count(*) AS n FROM imp.app_grade UNION ALL
  SELECT 'app_guest' AS t, count(*) AS n FROM imp.app_guest UNION ALL
  SELECT 'app_house_agent' AS t, count(*) AS n FROM imp.app_house_agent UNION ALL
  SELECT 'app_house_history' AS t, count(*) AS n FROM imp.app_house_history UNION ALL
  SELECT 'app_invoice' AS t, count(*) AS n FROM imp.app_invoice UNION ALL
  SELECT 'app_meal_price' AS t, count(*) AS n FROM imp.app_meal_price UNION ALL
  SELECT 'app_meal_type' AS t, count(*) AS n FROM imp.app_meal_type UNION ALL
  SELECT 'app_pavillon' AS t, count(*) AS n FROM imp.app_pavillon UNION ALL
  SELECT 'app_person' AS t, count(*) AS n FROM imp.app_person UNION ALL
  SELECT 'app_premi' AS t, count(*) AS n FROM imp.app_premi UNION ALL
  SELECT 'app_prestation' AS t, count(*) AS n FROM imp.app_prestation UNION ALL
  SELECT 'app_reservation' AS t, count(*) AS n FROM imp.app_reservation UNION ALL
  SELECT 'app_reservation_det' AS t, count(*) AS n FROM imp.app_reservation_det UNION ALL
  SELECT 'app_role' AS t, count(*) AS n FROM imp.app_role UNION ALL
  SELECT 'app_room' AS t, count(*) AS n FROM imp.app_room UNION ALL
  SELECT 'app_room_price' AS t, count(*) AS n FROM imp.app_room_price UNION ALL
  SELECT 'app_room_type' AS t, count(*) AS n FROM imp.app_room_type UNION ALL
  SELECT 'app_user' AS t, count(*) AS n FROM imp.app_user UNION ALL
  SELECT 'app_user_resource' AS t, count(*) AS n FROM imp.app_user_resource UNION ALL
  SELECT 'app_user_roles' AS t, count(*) AS n FROM imp.app_user_roles UNION ALL
  SELECT 'app_user_rooms' AS t, count(*) AS n FROM imp.app_user_rooms UNION ALL
  SELECT 'app_validated_room' AS t, count(*) AS n FROM imp.app_validated_room UNION ALL
  SELECT 'pem' AS t, count(*) AS n FROM imp.pem UNION ALL
  SELECT 'vonfi' AS t, count(*) AS n FROM imp.vonfi
) x GROUP BY t ORDER BY t;