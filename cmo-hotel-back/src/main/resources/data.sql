-- FEED GRADES
insert into grade (id ,code,name,rating,category) values (1,'GENA','GENERAL DARMEE',1,'OFFICIERS_GENERAUX');
insert into grade (id ,code,name,rating,category) values (2,'GENC','GENERAL DE CORPS DARMEE',2,'OFFICIERS_GENERAUX');
insert into grade (id ,code,name,rating,category) values (3,'GEND','GENERAL DE DIVISION',3,'OFFICIERS_GENERAUX');
insert into grade (id ,code,name,rating,category) values (4,'GENB','GENERAL DE BRIGADE',4,'OFFICIERS_GENERAUX');
insert into grade (id ,code,name,rating,category) values (5,'COLM','COLONEL-MAJOR',5,'OFFICIERS_GENERAUX');
insert into grade (id ,code,name,rating,category) values (6,'COL','COLONEL',6,'OFFICIER_SUPERIEUR');
insert into grade (id ,code,name,rating,category) values (7,'LCOL','LT-COLONEL',7,'OFFICIER_SUPERIEUR');
insert into grade (id ,code,name,rating,category) values (8,'CDT','COMMANDANT',8,'OFFICIER_SUPERIEUR');
insert into grade (id ,code,name,rating,category) values (9,'CNE','CAPITAINE',9,'OFFICIER_SUBALTERNE');
insert into grade (id ,code,name,rating,category) values (10,'LT','LIEUTENANT',10,'OFFICIER_SUBALTERNE');
insert into grade (id ,code,name,rating,category) values (11,'S/LT','S/LIEUTENANT',11,'OFFICIER_SUBALTERNE');
insert into grade (id ,code,name,rating,category) values (12,'ASP','ASPIRANT',12,'OFFICIER_SUBALTERNE');
insert into grade (id ,code,name,rating,category) values (13,'A/C','ADJUDANT-CHEF',13,'SOUS_OFFICIER');
insert into grade (id ,code,name,rating,category) values (14,'ADJ','ADJUDANT',14,'SOUS_OFFICIER');
insert into grade (id ,code,name,rating,category) values (15,'S/M','SERGENT-MAJOR',15,'SOUS_OFFICIER');
insert into grade (id ,code,name,rating,category) values (16,'S/C','SERGENT-CHEF',16,'SOUS_OFFICIER');
insert into grade (id ,code,name,rating,category) values (17,'SGT','SERGENT',17,'SOUS_OFFICIER');
insert into grade (id ,code,name,rating,category) values (18,'civil','CIVIL',18,'CIVIL');
SELECT setval('public."seq-grade"', (SELECT MAX(id) FROM grade));


insert into pavillon (id ,email,name,phone_number,stars_number) values(1,'oudayapav@gmail.com','OUDAYA','0610203040',5);
insert into pavillon (id ,email,name,phone_number,stars_number) values(2,'chellahpav@gmail.com','CHELLAH','0610203040',5);
SELECT setval('public."seq-pavillon"', (SELECT MAX(id) FROM pavillon));

insert into room_type (id,type,description) values (1,'Suite','Chambre spacieuse et luxueuse avec chambre séparée et salon, offrant un confort élevé et des équipements modernes. Idéale pour un séjour premium.');
insert into room_type (id,type,description) values (2,'Mini Suite','Chambre confortable avec un petit salon et un espace nuit, offrant plus d’espace et de confort qu’une chambre standard. Idéale pour un séjour agréable.');
insert into room_type (id,type,description) values (3,'Chambre Simple','Chambre pratique et confortable, équipée d’un lit simple et des équipements essentiels, idéale pour un séjour individuel.');
insert into room_type (id,type,description) values (4,'Suite Senior','Suite élégante et spacieuse avec salon et chambre séparée, offrant un haut niveau de confort et des équipements premium pour un séjour de luxe.');
insert into room_type (id,type,description) values (5,'Suite Junior','Suite moderne avec espace nuit et coin salon ouvert, offrant plus de confort et d’espace qu’une chambre classique, idéale pour un séjour premium.');
insert into room_type (id,type,description) values (6,'Chambre de luxe','Chambre élégante et raffinée, offrant un haut niveau de confort avec des équipements modernes pour un séjour agréable et prestigieux.');
SELECT setval('public."seq-room-type"', (SELECT MAX(id) FROM room_type));

------------------------------------------------------ room_price --------------------------------------------------------

------------- CHELLAH ------------------
insert into room_price (id ,room_type_id,category,price) values(1,1,'OFFICIERS_GENERAUX',400);
insert into room_price (id ,room_type_id,category,price) values(2,1,'OFFICIER_SUPERIEUR',300);
insert into room_price (id ,room_type_id,category,price) values(3,1,'OFFICIER_SUBALTERNE',250);
insert into room_price (id ,room_type_id,category,price) values(4,1,'CIVIL',450);

insert into room_price (id ,room_type_id,category,price) values(5,2,'OFFICIERS_GENERAUX',300);
insert into room_price (id ,room_type_id,category,price) values(6,2,'OFFICIER_SUPERIEUR',250);
insert into room_price (id ,room_type_id,category,price) values(7,2,'OFFICIER_SUBALTERNE',200);
insert into room_price (id ,room_type_id,category,price) values(8,2,'CIVIL',400);

insert into room_price (id ,room_type_id,category,price) values(9,3,'OFFICIERS_GENERAUX',250);
insert into room_price (id ,room_type_id,category,price) values(10,3,'OFFICIER_SUPERIEUR',200);
insert into room_price (id ,room_type_id,category,price) values(11,3,'OFFICIER_SUBALTERNE',160);
insert into room_price (id ,room_type_id,category,price) values(12,3,'CIVIL',300);

---------------- OUDAYA ------------------

insert into room_price (id ,room_type_id,category,price) values(13,4,'OFFICIERS_GENERAUX',800);
insert into room_price (id ,room_type_id,category,price) values(14,4,'OFFICIER_SUPERIEUR',600);
insert into room_price (id ,room_type_id,category,price) values(15,4,'CIVIL',800);

insert into room_price (id ,room_type_id,category,price) values(16,5,'OFFICIERS_GENERAUX',600);
insert into room_price (id ,room_type_id,category,price) values(17,5,'OFFICIER_SUPERIEUR',500);
insert into room_price (id ,room_type_id,category,price) values(18,5,'CIVIL',700);

insert into room_price (id ,room_type_id,category,price) values(19,6,'OFFICIERS_GENERAUX',450);
insert into room_price (id ,room_type_id,category,price) values(20,6,'OFFICIER_SUPERIEUR',300);
insert into room_price (id ,room_type_id,category,price) values(21,6,'CIVIL',500);

SELECT setval('public."seq-room-type"', (SELECT MAX(id) FROM room_price));


------------------------------------------------------ room --------------------------------------------------------

insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived) values(1,1,4,'SS1','desc1','SS1','1',true,2,false);
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived) values(2,1,5,'SJ1','desc1','SJ1','1',true,2,false);
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived) values(3,1,6,'CL1','desc1','CL1','1',true,2,false);

insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived) values(4,2,1,'S1','desc2','S1','1',true,2,false);
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived) values(5,2,2,'MS1','desc2','MS1','1',true,2,false);
insert into room (id ,pavillon_id,room_type_id,code,description,name,floor,clean,capacity,archived) values(6,2,3,'CS1','desc2','CS1','1',true,2,false);

SELECT setval('public."seq-room-type"', (SELECT MAX(id) FROM room));

-- =========================================
-- PERSON : 20 PRINCIPAUX + 40 FAMILLES
-- UUID FIXES (valide PostgreSQL)
-- Enum ERelationshipType: WIFE, SON, FATHER, MATHER
-- =========================================

INSERT INTO person (
    id, grade_id, primary_person_id, relationship_type,
    "identity", first_name, last_name, gender, email,
    birth_date, phone_number, nationality, language,
    matricule, unite, observation, archived
) VALUES

-- =======================
-- 20 PERSONNES PRINCIPALES
-- =======================
('11111111-1111-4111-8111-111111111111', 6,  NULL, NULL, 'AA123001', 'Mohammed',  'El Amrani',    'MALE', 'm.elamrani01@example.ma',   DATE '1975-06-10', '0612345001', 'Marocaine', 'Arabe/Français', 'MAT20260001', 'Génie',                'Personne principale', false),
('22222222-2222-4222-8222-222222222222', 9,  NULL, NULL, 'AB123002', 'Youssef',   'Benali',       'MALE', 'y.benali02@example.ma',     DATE '1982-03-14', '0612345002', 'Marocaine', 'Arabe',          'MAT20260002', 'Transmissions',         'Personne principale', false),
('33333333-3333-4333-8333-333333333333', 8,  NULL, NULL, 'AC123003', 'Hassan',    'Bennani',      'MALE', 'h.bennani03@example.ma',    DATE '1978-11-02', '0612345003', 'Marocaine', 'Arabe/Français', 'MAT20260003', 'Artillerie',           'Personne principale', false),
('44444444-4444-4444-8444-444444444444', 7,  NULL, NULL, 'AD123004', 'Karim',     'El Ghazi',     'MALE', 'k.elghazi04@example.ma',    DATE '1985-01-25', '0612345004', 'Marocaine', 'Français',       'MAT20260004', 'Bataillon Logistique', 'Personne principale', false),
('55555555-5555-4555-8555-555555555555', 10, NULL, NULL, 'AE123005', 'Rachid',    'Lamrani',      'MALE', 'r.lamrani05@example.ma',    DATE '1972-09-09', '0612345005', 'Marocaine', 'Arabe',          'MAT20260005', 'Marine',               'Personne principale', false),

('66666666-6666-4666-8666-666666666666', 11, NULL, NULL, 'AF123006', 'Said',      'El Idrissi',   'MALE', 's.elidrissi06@example.ma',  DATE '1979-04-18', '0612345006', 'Marocaine', 'Arabe/Français', 'MAT20260006', 'EMG',                  'Personne principale', false),
('77777777-7777-4777-8777-777777777777', 12, NULL, NULL, 'AG123007', 'Omar',      'Berrada',      'MALE', 'o.berrada07@example.ma',    DATE '1989-12-07', '0612345007', 'Marocaine', 'Français',       'MAT20260007', 'Aviation',             'Personne principale', false),
('88888888-8888-4888-8888-888888888888', 13, NULL, NULL, 'AH123008', 'Hamza',     'Alaoui',       'MALE', 'h.alaoui08@example.ma',     DATE '1987-08-30', '0612345008', 'Marocaine', 'Arabe/Français', 'MAT20260008', 'Gendarmerie',          'Personne principale', false),
('99999999-9999-4999-8999-999999999999', 14, NULL, NULL, 'AJ123009', 'Abdelilah', 'Touhami',      'MALE', 'a.touhami09@example.ma',    DATE '1970-02-11', '0612345009', 'Marocaine', 'Arabe',          'MAT20260009', 'Santé Militaire',      'Personne principale', false),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 15, NULL, NULL, 'AK123010', 'Nabil',     'Chraibi',      'MALE', 'n.chraibi10@example.ma',    DATE '1983-07-21', '0612345010', 'Marocaine', 'Français',       'MAT20260010', 'Forces Spéciales',     'Personne principale', false),

('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 16, NULL, NULL, 'AL123011', 'Mustapha',  'El Khatib',    'MALE', 'm.elkhatib11@example.ma',   DATE '1976-10-05', '0612345011', 'Marocaine', 'Arabe/Français', 'MAT20260011', 'Génie',                'Personne principale', false),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 17, NULL, NULL, 'AM123012', 'Amine',     'Boukhari',     'MALE', 'a.boukhari12@example.ma',   DATE '1990-05-16', '0612345012', 'Marocaine', 'Arabe',          'MAT20260012', 'Transmissions',         'Personne principale', false),
('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 5,  NULL, NULL, 'AN123013', 'Driss',     'El Fassi',     'MALE', 'd.elfassi13@example.ma',    DATE '1968-01-29', '0612345013', 'Marocaine', 'Français',       'MAT20260013', 'EMG',                  'Personne principale', false),
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 8,  NULL, NULL, 'AP123014', 'Hicham',    'Ouazzani',     'MALE', 'h.ouazzani14@example.ma',   DATE '1974-06-02', '0612345014', 'Marocaine', 'Arabe/Français', 'MAT20260014', 'Marine',               'Personne principale', false),
('ffffffff-ffff-4fff-8fff-ffffffffffff', 9,  NULL, NULL, 'AQ123015', 'Anas',      'Bouguerra',    'MALE', 'a.bouguerra15@example.ma',  DATE '1981-03-03', '0612345015', 'Marocaine', 'Arabe',          'MAT20260015', 'Artillerie',           'Personne principale', false),

('12121212-1212-4121-8121-121212121212', 6,  NULL, NULL, 'AR123016', 'Aziz',      'Cherkaoui',    'MALE', 'a.cherkaoui16@example.ma',  DATE '1986-09-17', '0612345016', 'Marocaine', 'Français',       'MAT20260016', 'Bataillon Logistique', 'Personne principale', false),
('13131313-1313-4131-8131-131313131313', 7,  NULL, NULL, 'AS123017', 'Simo',      'El Haddad',    'MALE', 's.elhaddad17@example.ma',   DATE '1977-12-12', '0612345017', 'Marocaine', 'Arabe/Français', 'MAT20260017', 'Aviation',             'Personne principale', false),
('14141414-1414-4141-8141-141414141414', 10, NULL, NULL, 'AT123018', 'Mehdi',     'Kabbaj',       'MALE', 'm.kabbaj18@example.ma',     DATE '1984-04-24', '0612345018', 'Marocaine', 'Arabe',          'MAT20260018', 'Gendarmerie',          'Personne principale', false),
('15151515-1515-4151-8151-151515151515', 11, NULL, NULL, 'AU123019', 'Badr',      'El Mansouri',  'MALE', 'b.elmansouri19@example.ma', DATE '1988-08-08', '0612345019', 'Marocaine', 'Français',       'MAT20260019', 'Santé Militaire',      'Personne principale', false),
('16161616-1616-4161-8161-161616161616', 12, NULL, NULL, 'AV123020', 'Adil',      'Benomar',      'MALE', 'a.benomar20@example.ma',    DATE '1973-05-27', '0612345020', 'Marocaine', 'Arabe/Français', 'MAT20260020', 'Forces Spéciales',     'Personne principale', false),

-- ===========================
-- 40 MEMBRES FAMILLE (2 par principal)
-- WIFE + SON pour tous
-- grade_id = 18 (CIVIL)
-- ===========================

-- Principal 1
('21111111-1111-4111-8111-111111111111', 18, '11111111-1111-4111-8111-111111111111', 'WIFE',  'BW123001', 'Fatima',  'El Amrani', 'FEMALE', 'fatima.elamrani01@example.ma',  DATE '1981-02-10', '0699901001', 'Marocaine', 'Arabe/Français', NULL, NULL, 'Membre famille (épouse)', false),
('31111111-1111-4111-8111-111111111111', 18, '11111111-1111-4111-8111-111111111111', 'SON',   'BS123001', 'Yassine', 'El Amrani', 'MALE',   'yassine.elamrani01@example.ma', DATE '2010-09-21', '0699902001', 'Marocaine', 'Arabe',          NULL, NULL, 'Membre famille (fils)',  false),

-- Principal 2
('22222222-1111-4222-8222-222222222222', 18, '22222222-2222-4222-8222-222222222222', 'WIFE',  'BW123002', 'Khadija', 'Benali',   'FEMALE', 'khadija.benali02@example.ma',   DATE '1986-06-15', '0699901002', 'Marocaine', 'Arabe',          NULL, NULL, 'Membre famille (épouse)', false),
('32222222-1111-4222-8222-222222222222', 18, '22222222-2222-4222-8222-222222222222', 'SON',   'BS123002', 'Ayoub',   'Benali',   'MALE',   'ayoub.benali02@example.ma',     DATE '2012-11-03', '0699902002', 'Marocaine', 'Arabe/Français', NULL, NULL, 'Membre famille (fils)',  false),

-- Principal 3
('23333333-1111-4333-8333-333333333333', 18, '33333333-3333-4333-8333-333333333333', 'WIFE',  'BW123003', 'Imane',   'Bennani',  'FEMALE', 'imane.bennani03@example.ma',    DATE '1983-01-09', '0699901003', 'Marocaine', 'Français',       NULL, NULL, 'Membre famille (épouse)', false),
('33333333-1111-4333-8333-333333333333', 18, '33333333-3333-4333-8333-333333333333', 'SON',   'BS123003', 'Othmane', 'Bennani',  'MALE',   'othmane.bennani03@example.ma',  DATE '2009-04-18', '0699902003', 'Marocaine', 'Arabe',          NULL, NULL, 'Membre famille (fils)',  false),

-- Principal 4
('24444444-1111-4444-8444-444444444444', 18, '44444444-4444-4444-8444-444444444444', 'WIFE',  'BW123004', 'Salma',   'El Ghazi', 'FEMALE', 'salma.elghazi04@example.ma',    DATE '1987-10-12', '0699901004', 'Marocaine', 'Arabe/Français', NULL, NULL, 'Membre famille (épouse)', false),
('34444444-1111-4444-8444-444444444444', 18, '44444444-4444-4444-8444-444444444444', 'SON',   'BS123004', 'Hamza',   'El Ghazi', 'MALE',   'hamza.elghazi04@example.ma',    DATE '2013-02-20', '0699902004', 'Marocaine', 'Français',       NULL, NULL, 'Membre famille (fils)',  false),

-- Principal 5
('25555555-1111-4555-8555-555555555555', 18, '55555555-5555-4555-8555-555555555555', 'WIFE',  'BW123005', 'Aicha',   'Lamrani',  'FEMALE', 'aicha.lamrani05@example.ma',    DATE '1980-07-07', '0699901005', 'Marocaine', 'Arabe',          NULL, NULL, 'Membre famille (épouse)', false),
('35555555-1111-4555-8555-555555555555', 18, '55555555-5555-4555-8555-555555555555', 'SON',   'BS123005', 'Nabil',   'Lamrani',  'MALE',   'nabil.lamrani05@example.ma',    DATE '2008-12-01', '0699902005', 'Marocaine', 'Arabe/Français', NULL, NULL, 'Membre famille (fils)',  false);
