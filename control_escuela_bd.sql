drop database IF EXISTS control_escuela_bd; 

create database control_escuela_bd;

use control_escuela_bd;

create table Status(
	idStatus int auto_increment primary KEY,
    status varchar(15) UNIQUE
);

create table Student(
	idStudent binary(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    first_name varchar(255) NOT NULL,
    last_first_name varchar(255) NOT NULL,
    last_second_name varchar(255),
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    telephone varchar(11),
    idStatus int,
    foreign key(idStatus) references Status(idStatus)
);

create table Administrative(
	idAdministrative binary(16) PRIMARY KEY DEFAULT(UUID_TO_BIN(UUID())),
    first_name varchar(255) NOT NULL,
    last_first_name varchar(255) NOT NULL,
    last_second_name varchar(255),
    email varchar(255) NOT NULL,
    password varchar(255) NOT null,
    telephone varchar(10),
    idStatus int,
    foreign key(idStatus) references Status(idStatus)
);

create table Course(
	idCourse binary(16) primary key default(UUID_TO_BIN(UUID())),
    subject_course varchar(255) NOT NULL,
    grade_course int not null,
    group_course char(1) not null,
    idAdministrative binary(16),
    foreign key (idAdministrative) references Administrative(idAdministrative)
);

create table Occupation(
	idOccupation int auto_increment primary KEY,
    occupation varchar(255) UNIQUE
);

create table Attendance_Status(
	idAttendance_Status int auto_increment primary key,
    status varchar(255)
);

create table Administrative_has_Occupation(
	idAdministrative binary(16),
    idOccupation int,
	FOREIGN KEY (idAdministrative) references Administrative(idAdministrative),
    FOREIGN KEY (idOccupation) references Occupation(idOccupation),
    PRIMARY KEY(idAdministrative,idOccupation)
);

create table Student_has_Course(
	idStudent binary(16),
    idCourse binary(16) ,
    foreign key (idStudent) references Student(idStudent),
    foreign key (idCourse) references Course(idCourse),
    PRIMARY KEY (idStudent, idCourse)
);

create table Attendance_List(
	idStudent binary(16),
    idCourse binary(16) ,
    idAttendance_Status int,
    date date,
	FOREIGN KEY (idStudent, idCourse) REFERENCES Student_has_Course(idStudent, idCourse),
    foreign key (idAttendance_Status) references Attendance_Status(idAttendance_Status),
    primary key(idStudent,idCourse,date)
);

CREATE TABLE Grades (
    idStudent BINARY(16),
    idCourse BINARY(16),
    partial1 DECIMAL(2,1) UNSIGNED,
    partial2 DECIMAL(2,1) UNSIGNED,
    partial3 DECIMAL(2,1) UNSIGNED,
    final DECIMAL(2,1) UNSIGNED,
    PRIMARY KEY (idStudent, idCourse),
    FOREIGN KEY (idStudent,idCourse) REFERENCES Student_has_Course(idStudent,idCourse)
);

insert into Status(status) values
("activo"),
("baja"),
("suspendido");

INSERT INTO Student(idStudent,first_name,last_first_name,last_second_name,email,password,telephone,idStatus) values
(UUID_TO_BIN(UUID()),"Pedro Enrique","Teran","Cortes","pedro987@gmail.com","12345","3491966690",(SELECT idStatus from Status Where Status.status="Activo")),
(UUID_TO_BIN(UUID()),"Daniel","Guzman","Alonso","dani1234@gmail.com","67890","1491987832",(SELECT idStatus from Status Where Status.status="Activo")),
(UUID_TO_BIN(UUID()),"Salvador Eduardo","Garcia","Velez","elEdu@gmail.com","1234556","54929386091",(SELECT idStatus from Status Where Status.status="Activo"));

insert into Administrative(idAdministrative,first_name ,last_first_name ,last_second_name,email,password,telephone,idStatus) values
(UUID_TO_BIN(UUID()),"Naomi","Garcia","Velez","director123@gmail.com","d12345","9491468010",1),
(UUID_TO_BIN(UUID()),"Maria Olga","Cruz","Campos","teco123@gmail.com","m12345","3491968017",1); 

insert into Course(idCourse,subject_course,grade_course,group_course,idAdministrative) values
(UUID_TO_BIN(UUID()),"Derecho",8,"A",(select idAdministrative from Administrative where first_name="Maria Olga"));

insert into Occupation(occupation) values
("director"),
("maestro");

insert into Attendance_Status (status) values
("presente"),
("ausente"),
("justificado");

insert into Administrative_has_Occupation(idAdministrative,idOccupation) values
((SELECT idAdministrative from Administrative where first_name="Naomi"),1),
((SELECT idAdministrative from Administrative where first_name="Maria Olga"),2);

insert into Student_has_Course(idStudent,idCourse) values
((SELECT idStudent from Student where first_name="Pedro Enrique"),(SELECT idCourse from Course where subject_course="Derecho")),
((SELECT idStudent from Student where first_name="Daniel"),(SELECT idCourse from Course where subject_course="Derecho")),
((SELECT idStudent from Student where first_name="Salvador Eduardo"),(SELECT idCourse from Course where subject_course="Derecho"));

INSERT INTO Attendance_List(idStudent,idCourse,idAttendance_Status,date) VALUES
((SELECT idStudent from Student where first_name="Pedro Enrique"),(SELECT idCourse from Course where subject_course="Derecho"),2,(select current_date())),
((SELECT idStudent from Student where first_name="Daniel"),(SELECT idCourse from Course where subject_course="Derecho"),2,(select current_date())),
((SELECT idStudent from Student where first_name="Salvador Eduardo"),(SELECT idCourse from Course where subject_course="Derecho"),2,(select current_date()));

INSERT INTO Grades (idStudent, idCourse, partial1, partial2, partial3)
VALUES
((SELECT idStudent FROM Student WHERE first_name = "Pedro Enrique"), (SELECT idCourse FROM Course WHERE subject_course = "Derecho"), 9.0, 8.5, 9.2 ),
((SELECT idStudent FROM Student WHERE first_name = "Daniel"), (SELECT idCourse FROM Course WHERE subject_course = "Derecho"), 8.7, 8.9, 9.1),
((SELECT idStudent FROM Student WHERE first_name = "Salvador Eduardo"), (SELECT idCourse FROM Course WHERE subject_course = "Derecho"), 9.5, 9.2, 9.4);

update Grades set Grades.final=((Grades.partial1+Grades.partial2+Grades.partial3)/3)
where idStudent=(SELECT idStudent FROM Student WHERE first_name = "Pedro Enrique"); 

update Grades set Grades.final=((Grades.partial1+Grades.partial2+Grades.partial3)/3)
where idStudent=(SELECT idStudent FROM Student WHERE first_name = "Daniel"); 

update Grades set Grades.final=((Grades.partial1+Grades.partial2+Grades.partial3)/3)
where idStudent=(SELECT idStudent FROM Student WHERE first_name = "Salvador Eduardo"); 

select BIN_TO_UUID(idStudent) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Student.idStatus)Status
from Student;

select BIN_TO_UUID(idAdministrative) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Administrative.idStatus)status
from Administrative;

select BIN_TO_UUID(idStudent),BIN_TO_UUID(idCourse) 
FROM Student_has_Course;

select BIN_TO_UUID(Administrative.idAdministrative) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Administrative.idStatus)status,(Occupation.occupation)
from Administrative
inner join Administrative_has_Occupation on Administrative.idAdministrative=Administrative_has_Occupation.idAdministrative
inner join Occupation on Administrative_has_Occupation.idOccupation=Occupation.idOccupation;

select BIN_TO_UUID(Administrative.idAdministrative) id,first_name,last_first_name,last_second_name,email,password,telephone,
(Select status from Status where Status.idStatus=Administrative.idStatus)status,
(select Occupation.occupation from Occupation, Administrative_has_Occupation where Administrative.idAdministrative=Administrative_has_Occupation.idAdministrative and Occupation.idOccupation=Administrative_has_Occupation.idOccupation)occupation
from Administrative;



SELECT 
    BIN_TO_UUID(Administrative.idAdministrative) AS id,
    first_name,
    last_first_name,
    last_second_name,
    email,
    password,
    telephone,
    Status.status,
    GROUP_CONCAT(Occupation.occupation) AS occupation
FROM 
    Administrative
INNER JOIN 
    Administrative_has_Occupation ON Administrative.idAdministrative = Administrative_has_Occupation.idAdministrative
INNER JOIN 
    Occupation ON Administrative_has_Occupation.idOccupation = Occupation.idOccupation
INNER JOIN 
    Status ON Status.idStatus = Administrative.idStatus
GROUP BY
    Administrative.idAdministrative;


SELECT 
            BIN_TO_UUID(idAdministrative) id,
            first_name,
            last_first_name,
            last_second_name,
            email,
            password,
            telephone,
            (Select status from Status where Status.idStatus=Administrative.idStatus)status,
            group_concat((SELECT Occupation.occupation 
                FROM Occupation, Administrative_has_Occupation 
                WHERE Administrative.idAdministrative = Administrative_has_Occupation.idAdministrative 
                AND Occupation.idOccupation = Administrative_has_Occupation.idOccupation)) occupation
            FROM Administrative
            Where idAdministrative=UUID_TO_BIN("86b9d1b3-cb3e-11ee-b1b3-0a002700000a")
            GROUP BY
                Administrative.idAdministrative;
                
Select          
	BIN_TO_UUID(Course.idCourse)Course,
    Course.subject_course,
    Course.grade_course,
    Course.group_course,
    concat(
    first_name," ", 
    last_first_name," ",
    last_second_name)teacher_name,
    BIN_TO_UUID(Administrative.idAdministrative)idAdministrative
FROM 
	Course
inner join Administrative ON
	Course.idAdministrative=Administrative.idAdministrative;

Select          
                BIN_TO_UUID(idCourse)Course,
                subject_course,
                grade_course,
                group_course,
                BIN_TO_UUID(idAdministrative) Teacher
            FROM Course;


Select *
FROM Attendance_List;


 INSERT INTO Attendance_List(idStudent,idCourse,idAttendance_Status,date) VALUES
 (UUID_TO_BIN("1d25df00-cc68-11ee-bee4-0a002700000a"),UUID_TO_BIN("1d26d594-cc68-11ee-bee4-0a002700000a"),(SELECT idAttendance_Status from Attendance_Status where status="presente"),(select current_date()));
/*
SELECT 
    BIN_TO_UUID(Administrative.idAdministrative) AS id,
    first_name,
    last_first_name,
    last_second_name,
    email,
    password,
    telephone,
    (SELECT status FROM Status WHERE Status.idStatus = Administrative.idStatus) AS status,
    (SELECT Occupation.occupation 
     FROM Occupation, Administrative_has_Occupation 
     WHERE Administrative.idAdministrative = Administrative_has_Occupation.idAdministrative 
       AND Occupation.idOccupation = Administrative_has_Occupation.idOccupation) AS occupation
FROM 
    Administrative;

SELECT 
    BIN_TO_UUID(Administrative.idAdministrative) AS id,
    first_name,
    last_first_name,
    last_second_name,
    email,
    password,
    telephone,
    (SELECT status FROM Status WHERE Status.idStatus = Administrative.idStatus) AS status
FROM 
    Administrative, Administrative_has_Occupation
Where 	(Administrative_has_Occupation.idOccupation=(Select idOccupation From Occupation where occupation="director") or Administrative_has_Occupation.idOccupation=(Select idOccupation From Occupation where occupation="maestro"))
and 
Administrative.idAdministrative = Administrative_has_Occupation.idAdministrative ;

SELECT 
    BIN_TO_UUID(Administrative.idAdministrative) AS id,
    first_name,
    last_first_name,
    last_second_name,
    email,
    password,
    telephone,
    (SELECT status FROM Status WHERE Status.idStatus = Administrative.idStatus) AS status
FROM 
    Administrative
INNER JOIN 
    Administrative_has_Occupation ON Administrative.idAdministrative = Administrative_has_Occupation.idAdministrative
WHERE 
    Administrative_has_Occupation.idOccupation IN (
        SELECT idOccupation FROM Occupation WHERE occupation IN ('director')
    );


SELECT BIN_TO_UUID(idStudent) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Student.idStatus)status 
FROM Student
Where idStatus=(Select idStatus From Status where status="activo") OR idStatus=(Select idStatus From Status where status="suspendido");
*/
