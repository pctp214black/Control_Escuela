import mysql from "mysql2/promise";

import dotenv from "dotenv";

dotenv.config();

const connection=await mysql2.createConnection({
    database:"control_escuela_bd",
    host:"localhost",
    user:"root",
    password:process.env.SQL_PASSWORD,
    port:"3306"
});

export class StudentModel{
    static async getAllStudents({status}){
        if(Object.keys(status).length !== 0){
            let statusType=[];
            let whereStatus=[];
            for(let valor in status){
                statusType.push(status[valor].toLowerCase());
                whereStatus.push("idStatus=(Select idStatus From Status where status=?)");
            }
            const [allStudentsStatus]=await connection.query(
                `SELECT BIN_TO_UUID(idStudent) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Student.idStatus)status 
                FROM Student
                Where ${whereStatus.join(" OR ")};`,
                [...statusType]
            ); 
            return allStudentsStatus;
        }
        const [allStudents]=await connection.query(
            `SELECT BIN_TO_UUID(idStudent) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Student.idStatus)status 
            FROM Student;`
        );
        return allStudents;
    }
    static async getStudentById({id}){
        const [student]=await connection.query(
            `SELECT BIN_TO_UUID(idStudent) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Student.idStatus)status
            FROM Student
            Where idStudent=UUID_TO_BIN(?)`,
            [id]
        );
        return student;
    }

    static async createNewStudent({input}){
        const{
            first_name,
            last_first_name,
            last_second_name,
            email,
            password,
            telephone
        }=input;
        const [uuidResult]=await connection.query("SELECT UUID() uuid");
        const [{uuid}]=uuidResult;
        const newStudent=await connection.query(
            `INSERT INTO Student(idStudent,first_name,last_first_name,last_second_name,email,password,telephone,idStatus) values
            (UUID_TO_BIN(?),?,?,?,?,?,?,(Select idStatus from Status where status="Activo"));`,
            [uuid,first_name,last_first_name,last_second_name,email,password,telephone]
        );
        const [student]=await connection.query(
            `Select BIN_TO_UUID(idStudent) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Student.idStatus)status
            FROM Student
            Where idStudent=UUID_TO_BIN(?);`,
            [uuid]
        )
        return student;
    }

    static async enrollStudentInCourse({idStudent,idCourse}){
        const [studentInCourse]=await connection.query(
            `insert into Student_has_Course(idStudent,idCourse) values
            (UUID_TO_BIN(?),UUID_TO_BIN(?));`,
            [idStudent,idCourse]
        );
        if(studentInCourse.affectedRows===0){
            return [400,{message:"Does not exist course or student"}];
        }
        const [[studentName]]=await connection.query(
            `select CONCAT(first_name, " ", last_first_name," ",last_second_name) AS full_name
            from Student
            Where idStudent=UUID_TO_BIN(?);`,
            [idStudent]
        );
        
        const [[courseName]]=await connection.query(
            `Select subject_course
            From Course
            Where idCourse=UUID_TO_BIN(?);`,
            [idCourse]
        );
        return [201,{message:`The student ${studentName.full_name} has been signed up in ${courseName.subject_course}`}];
    }

    static async updateStudent({id,input}){
        let columns=[];
        let updates=[];
        for(let column in input){
            
            if(column==="status"){
                columns.push(`idStatus=?`);
                const [[s]]=await connection.query(`
                    select idStatus from Status where status=?;`,
                    [input[column]]    
                );
                const {idStatus}=s;
                updates.push(idStatus);
            }else{
                columns.push(`${column}=?`);
                updates.push(input[column]);
            }
            
        }
        updates.push(id);
        const [studentUpdate]=await connection.query(
            `UPDATE Student Set ${columns.join(",")} where idStudent=UUID_TO_BIN(?)`,
            [...updates]
        )
        if(studentUpdate.affectedRows===0){
            return [404,{message:"Student not found"}];
        }
        const [updateStudent]=await connection.query(
            `Select BIN_TO_UUID(idStudent) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Student.idStatus)status
            FROM Student
            Where idStudent=UUID_TO_BIN(?);`,
            [id]
        );
        return [200,updateStudent];
    }

    static async deleteStudent({id}){
        const [result]=await connection.query(
            `DELETE 
            FROM Student_has_Course
            Where idStudent=UUID_TO_BIN(?);`,
            [id]
        );
        if(result.affectedRows==0){
            return false;
        }
        await connection.query(
            `DELETE 
            FROM Student
            Where idStudent=UUID_TO_BIN(?);`,
            [id]
        );
        return true;
    }

    static async disenrollStudentFromCourse({idStudent,idCourse}){
        const [[courseResult]]=await connection.query(
            `Select subject_course 
            from Course
            Where idCourse=UUID_TO_BIN(?)`,
            [idCourse]
        );
        if(!courseResult){
            return [404,{message:"Course not found"}];
        }
        
        await connection.query(
            `DELETE 
            FROM Attendance_List
            Where idStudent=UUID_TO_BIN(?) AND idCourse=UUID_TO_BIN(?);`,
            [idStudent,idCourse]
        );
        await connection.query(
            `DELETE 
            FROM Grades
            Where idStudent=UUID_TO_BIN(?) AND idCourse=UUID_TO_BIN(?);`,
            [idStudent,idCourse]
        );
        const [result]=await connection.query(
            `DELETE 
            FROM Student_has_Course
            Where idStudent=UUID_TO_BIN(?) AND idCourse=UUID_TO_BIN(?);`,
            [idStudent,idCourse]
        );
        if(result.affectedRows==0){
            return [404,{message:"Student not found"}];
        }
        return [200,{message:`Student deleted from ${courseResult.subject_course}`}]
    }
}