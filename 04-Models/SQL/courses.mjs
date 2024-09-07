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

export class CourseModel{
    static async getAllCourses({status}){
        const [allCourses]=await connection.query(
            `Select          
                BIN_TO_UUID(idCourse)Course,
                subject_course,
                grade_course,
                group_course,
                BIN_TO_UUID(idAdministrative) Teacher
            FROM Course;`
        );
        return allCourses;
    }
    
    static async getCourseById({id}){
        const [Course]=await connection.query(
            `Select          
                BIN_TO_UUID(Course.idCourse)Course,
                Course.subject_course,
                Course.grade_course,
                Course.group_course,
                concat(
                first_name," ", 
                last_first_name)teacher_name,
                BIN_TO_UUID(Course.idAdministrative)idAdministrative
            FROM 
                Course
            inner join Administrative ON
                Course.idAdministrative=Administrative.idAdministrative
            Where
                Course.idCourse=UUID_TO_BIN(?);`,
            [id]
        );
        return Course;
    }

    static async createNewCourse({input}){
        const{
            subject_course,
            grade_course,
            group_course,
            idAdministrative
        }=input;
        const [uuidResult]=await connection.query("SELECT UUID() uuid");
        const [{uuid}]=uuidResult;
        const [newCourse]=await connection.query(
            `insert into Course(idCourse,subject_course,grade_course,group_course,idAdministrative) values
            (UUID_TO_BIN(?),?,?,?,UUID_TO_BIN(?));`,
            [uuid,subject_course,grade_course,group_course,idAdministrative]
        );
        const [Course]=await CourseModel.getCourseById({id:uuid});
        return Course;
    }

    static async updateCourse({id,input}){
        let columns=[];
        let updates=[];
        for(let column in input){
            columns.push(`${column}=?`);
            updates.push(input[column]);
        }
        updates.push(id);
        const [CourseUpdate]=await connection.query(
            `UPDATE Course Set ${columns.join(",")} where idCourse=UUID_TO_BIN(?)`,
            [...updates]
        )
        if(CourseUpdate.affectedRows===0){
            return [404,{message:"Course not found"}];
        }
        const [updateCourse]=await CourseModel.getCourseById({id:id});
        return [200,updateCourse];
    }

    static async deleteCourse({id}){
        const [result]=await CourseModel.getCourseById({id:id});
        console.log(result);
        
        if(!result){
            return false;
        }
        await connection.query(
            `DELETE 
            FROM Student_has_Course
            Where idCourse=UUID_TO_BIN(?);`,
            [id]
        );
        await connection.query(
            `DELETE 
            FROM Attendance_List
            Where idCourse=UUID_TO_BIN(?);`,
            [id]
        );
        await connection.query(
            `DELETE 
            FROM Grades
            Where idCourse=UUID_TO_BIN(?);`,
            [id]
        );
        await connection.query(
            `DELETE 
            FROM Course
            Where idCourse=UUID_TO_BIN(?);`,
            [id]
        );
        return true;
    }

    static async attendanceList({input}){
        const {
            idStudent,
            idCourse,
            idAttendance_Status
        }=input;
        const [result]=await connection.query(
            ` INSERT INTO Attendance_List(idStudent,idCourse,idAttendance_Status,date) VALUES
            (UUID_TO_BIN(),UUID_TO_BIN(),(SELECT idAttendance_Status from Attendance_Status where status="presente"),(select current_date()));`,
            [idStudent,idCourse,idAttendance_Status]
        );
        console.log(result);
        
    }
}