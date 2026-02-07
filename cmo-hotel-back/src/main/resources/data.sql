-- FEED GRADES
insert into grade (id ,code,name,rating,category) values (1,'CM','COLONEL MAJOR',5,'OFFICIER_SUPERIEUR');
insert into grade (id ,code,name,rating,category) values (2,'CNE','CAPITAINE',8,'OFFICIER_SUBALTERNE');
insert into grade (id ,code,name,rating,category) values (3,'CIVIL','CIVIL',999,'CIVIL');
SELECT setval('public."seq-grade"', (SELECT MAX(id) FROM grade));
