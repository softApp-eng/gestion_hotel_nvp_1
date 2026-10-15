DROP SCHEMA IF EXISTS imp CASCADE;
CREATE SCHEMA imp;

CREATE TABLE imp.app_details (c01 text);
\copy imp.app_details from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_details' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_grade (c01 text, c02 text, c03 text, c04 text, c05 text);
\copy imp.app_grade from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_grade' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_guest (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text);
\copy imp.app_guest from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_guest' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_house_agent (c01 text, c02 text, c03 text, c04 text, c05 text);
\copy imp.app_house_agent from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_house_agent' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_house_history (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text);
\copy imp.app_house_history from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_house_history' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_invoice (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text, c12 text, c13 text, c14 text, c15 text, c16 text, c17 text, c18 text, c19 text, c20 text);
\copy imp.app_invoice from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_invoice' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_meal_price (c01 text, c02 text, c03 text, c04 text);
\copy imp.app_meal_price from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_meal_price' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_meal_type (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text);
\copy imp.app_meal_type from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_meal_type' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_pavillon (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text);
\copy imp.app_pavillon from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_pavillon' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_person (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text, c12 text, c13 text, c14 text, c15 text, c16 text, c17 text);
\copy imp.app_person from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_person' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_premi (c01 text, c02 text);
\copy imp.app_premi from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_premi' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_prestation (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text, c12 text, c13 text);
\copy imp.app_prestation from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_prestation' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_reservation (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text, c12 text, c13 text);
\copy imp.app_reservation from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_reservation' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_reservation_det (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text, c12 text, c13 text, c14 text);
\copy imp.app_reservation_det from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_reservation_det' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_role (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text);
\copy imp.app_role from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_role' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_room (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text, c12 text, c13 text, c14 text, c15 text, c16 text);
\copy imp.app_room from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_room' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_room_price (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text);
\copy imp.app_room_price from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_room_price' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_room_type (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text);
\copy imp.app_room_type from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_room_type' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_user (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text);
\copy imp.app_user from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_user' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_user_resource (c01 text, c02 text);
\copy imp.app_user_resource from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_user_resource' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_user_roles (c01 text, c02 text);
\copy imp.app_user_roles from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_user_roles' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_user_rooms (c01 text, c02 text);
\copy imp.app_user_rooms from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_user_rooms' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.app_validated_room (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text, c08 text, c09 text, c10 text, c11 text);
\copy imp.app_validated_room from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\app_validated_room' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.pem (c01 text, c02 text, c03 text, c04 text, c05 text, c06 text, c07 text);
\copy imp.pem from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\pem' with (format csv, null '', encoding 'UTF8');

CREATE TABLE imp.vonfi (c01 text, c02 text, c03 text);
\copy imp.vonfi from 'F:\github\04-hotel\insp_app\cmo-hotel\etl\norm\vonfi' with (format csv, null '', encoding 'UTF8');

SELECT '--- tables existantes (public) ---';
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;
