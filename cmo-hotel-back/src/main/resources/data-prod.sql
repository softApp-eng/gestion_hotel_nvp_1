-- FEED GRADES
-- IDEMPOTENT : ne cree que les lignes manquantes, ne modifie/supprime jamais les donnees existantes
insert into grade (id ,code,name,rating,category) values (1,'GENA','GENERAL DARMEE',1,'OFFICIERS_GENERAUX') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (2,'GENC','GENERAL DE CORPS DARMEE',2,'OFFICIERS_GENERAUX') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (3,'GEND','GENERAL DE DIVISION',3,'OFFICIERS_GENERAUX') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (4,'GENB','GENERAL DE BRIGADE',4,'OFFICIERS_GENERAUX') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (5,'COLM','COLONEL-MAJOR',5,'OFFICIERS_GENERAUX') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (6,'COL','COLONEL',6,'OFFICIER_SUPERIEUR') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (7,'LCOL','LT-COLONEL',7,'OFFICIER_SUPERIEUR') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (8,'CDT','COMMANDANT',8,'OFFICIER_SUPERIEUR') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (9,'CNE','CAPITAINE',9,'OFFICIER_SUBALTERNE') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (10,'LT','LIEUTENANT',10,'OFFICIER_SUBALTERNE') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (11,'S/LT','S/LIEUTENANT',11,'OFFICIER_SUBALTERNE') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (12,'ASP','ASPIRANT',12,'OFFICIER_SUBALTERNE') ON CONFLICT (id) DO NOTHING;
insert into grade (id ,code,name,rating,category) values (18,'civil','CIVIL',18,'CIVIL') ON CONFLICT (id) DO NOTHING;
SELECT setval('public."seq-grade"', (SELECT MAX(id) FROM grade));


insert into pavillon (id ,email,name,phone_number,stars_number) values(1,'oudayapav@gmail.com','OUDAYA','0610203040',5) ON CONFLICT (id) DO NOTHING;
insert into pavillon (id ,email,name,phone_number,stars_number) values(2,'chellahpav@gmail.com','CHELLAH','0610203040',4) ON CONFLICT (id) DO NOTHING;
SELECT setval('public."seq-pavillon"', (SELECT MAX(id) FROM pavillon));

insert into room_type (id,type,description) values (1,'Suite','Chambre spacieuse et luxueuse avec chambre séparée et salon, offrant un confort élevé et des équipements modernes. Idéale pour un séjour premium.') ON CONFLICT (id) DO NOTHING;
insert into room_type (id,type,description) values (2,'Mini Suite','Chambre confortable avec un petit salon et un espace nuit, offrant plus d’espace et de confort qu’une chambre standard. Idéale pour un séjour agréable.') ON CONFLICT (id) DO NOTHING;
insert into room_type (id,type,description) values (3,'Chambre Simple','Chambre pratique et confortable, équipée d’un lit simple et des équipements essentiels, idéale pour un séjour individuel.') ON CONFLICT (id) DO NOTHING;
insert into room_type (id,type,description) values (4,'Suite Senior','Suite élégante et spacieuse avec salon et chambre séparée, offrant un haut niveau de confort et des équipements premium pour un séjour de luxe.') ON CONFLICT (id) DO NOTHING;
insert into room_type (id,type,description) values (5,'Suite Junior','Suite moderne avec espace nuit et coin salon ouvert, offrant plus de confort et d’espace qu’une chambre classique, idéale pour un séjour premium.') ON CONFLICT (id) DO NOTHING;
insert into room_type (id,type,description) values (6,'Chambre de luxe','Chambre élégante et raffinée, offrant un haut niveau de confort avec des équipements modernes pour un séjour agréable et prestigieux.') ON CONFLICT (id) DO NOTHING;
SELECT setval('public."seq-room-type"', (SELECT MAX(id) FROM room_type));

------------------------------------------------------ room_price --------------------------------------------------------

------------- CHELLAH ------------------
insert into room_price (id ,room_type_id,category,price) values(1,1,'OFFICIERS_GENERAUX',400) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(2,1,'OFFICIER_SUPERIEUR',300) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(3,1,'OFFICIER_SUBALTERNE',250) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(4,1,'CIVIL',450) ON CONFLICT (id) DO NOTHING;

insert into room_price (id ,room_type_id,category,price) values(5,2,'OFFICIERS_GENERAUX',300) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(6,2,'OFFICIER_SUPERIEUR',250) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(7,2,'OFFICIER_SUBALTERNE',200) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(8,2,'CIVIL',400) ON CONFLICT (id) DO NOTHING;

insert into room_price (id ,room_type_id,category,price) values(9,3,'OFFICIERS_GENERAUX',250) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(10,3,'OFFICIER_SUPERIEUR',200) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(11,3,'OFFICIER_SUBALTERNE',160) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(12,3,'CIVIL',300) ON CONFLICT (id) DO NOTHING;

---------------- OUDAYA ------------------

insert into room_price (id ,room_type_id,category,price) values(13,4,'OFFICIERS_GENERAUX',800) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(14,4,'OFFICIER_SUPERIEUR',600) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(15,4,'CIVIL',800) ON CONFLICT (id) DO NOTHING;

insert into room_price (id ,room_type_id,category,price) values(16,5,'OFFICIERS_GENERAUX',600) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(17,5,'OFFICIER_SUPERIEUR',500) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(18,5,'CIVIL',700) ON CONFLICT (id) DO NOTHING;

insert into room_price (id ,room_type_id,category,price) values(19,6,'OFFICIERS_GENERAUX',450) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(20,6,'OFFICIER_SUPERIEUR',300) ON CONFLICT (id) DO NOTHING;
insert into room_price (id ,room_type_id,category,price) values(21,6,'CIVIL',500) ON CONFLICT (id) DO NOTHING;

SELECT setval('public."seq-room-price"', (SELECT MAX(id) FROM room_price));


------------------------------------------------------ room --------------------------------------------------------

insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(1,1,4,'SS1','desc1','SS1','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(2,1,4,'SS2','desc1','SS2','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(3,1,4,'SS3','desc1','SS3','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(4,1,5,'SJ1','desc1','SJ1','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(5,1,5,'SJ2','desc1','SJ2','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(6,1,5,'SJ3','desc1','SJ3','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(7,1,6,'CL1','desc1','CL1','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(8,1,6,'CL2','desc1','CL2','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;

insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(9,2,1,'S1','desc2','S1','1',true,2,false, true, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(10,2,1,'S2','desc2','S2','1',true,2,false, true, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(11,2,1,'S3','desc2','S3','1',true,2,false, true, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(12,2,1,'S4','desc2','S4','1',true,2,false, true, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(13,2,2,'MS1','desc2','MS1','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(14,2,2,'MS2','desc2','MS2','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(15,2,3,'CS1','desc2','CS1','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(16,2,3,'CS2','desc2','CS2','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(17,2,3,'CS3','desc2','CS3','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(18,2,3,'CS4','desc2','CS4','2',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(19,2,3,'CS5','desc2','CS5','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived, shared, available) values(20,2,3,'CS6','desc2','CS6','1',true,2,false, false, true) ON CONFLICT (id) DO NOTHING;

SELECT setval('public."seq-room"', (SELECT MAX(id) FROM room));

INSERT INTO meal_type (id,  name, description) VALUES (1, 'Petit déjeuner', 'Repas servi avant midi.') ON CONFLICT (id) DO NOTHING;
INSERT INTO meal_type (id,  name, description) VALUES (2, 'Déjeuner', 'Repas servi à midi.') ON CONFLICT (id) DO NOTHING;
INSERT INTO meal_type (id,  name, description) VALUES (3, 'Dîner', 'Repas servi le soir.') ON CONFLICT (id) DO NOTHING;
SELECT setval('meal_type_seq', (SELECT MAX(id) FROM meal_type));


INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (1, 1, 'OFFICIERS_GENERAUX', 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (2, 1, 'OFFICIER_SUPERIEUR', 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (3, 1, 'CIVIL', 20) ON CONFLICT (id) DO NOTHING;


INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (4, 2, 'OFFICIERS_GENERAUX', 80) ON CONFLICT (id) DO NOTHING;
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (5, 2, 'OFFICIER_SUPERIEUR', 60) ON CONFLICT (id) DO NOTHING;
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (6, 2, 'CIVIL', 50) ON CONFLICT (id) DO NOTHING;



INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (7, 3, 'OFFICIERS_GENERAUX', 80) ON CONFLICT (id) DO NOTHING;
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (8, 3, 'OFFICIER_SUPERIEUR', 60) ON CONFLICT (id) DO NOTHING;
INSERT INTO meal_price (id, meal_type_id, category, price) VALUES (9, 3, 'CIVIL', 50) ON CONFLICT (id) DO NOTHING;

SELECT setval('meal_price_seq', (SELECT MAX(id) FROM meal_price));