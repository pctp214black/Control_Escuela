import { validateStudent,validatePartialStudent,validateStudentCourseSchema } from "../Schemas/students.mjs";


export class createStudentController{
    constructor({StudentModel}){
        this.StudentModel=StudentModel;
    }

    //Obtener todos los alumnos
    getAllStudents=async (req,res)=>{
        const status=req.query;
        const allStudents=await this.StudentModel.getAllStudents({status});
        return res.status(200).json(allStudents);
    }

    //Obtener alumno por ID
    getStudentById=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const student=await this.StudentModel.getStudentById({id:id});
       /* if(student.length===0){
            return res.status(404).json({message:"Student not found"});
        }*/
        return res.status(200).json(student);
    }

    //Crear un nuevo alumno
    createNewStudent=async(req,res)=>{
        const response=validateStudent(req.body);
        if(response.success===false){
            return res.status(400).json({message:response.error});
        }
        const newStudent=await this.StudentModel.createNewStudent({input:response.data});
        return res.status(201).json(newStudent);
    }

    enrollStudentInCourse=async(req,res)=>{
        const result=validateStudentCourseSchema(req.body);
        if(result.success===false){
            return res.status(400).json({message:result.error});
        }
        const [status,message]=await this.StudentModel.enrollStudentInCourse({idStudent:result.data.id_student,idCourse:result.data.id_course});
        return res.status(status).json(message)
    }

    updateStudent=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const response=validatePartialStudent(req.body);
        if(response.success===false){
            return res.status(400).json(response.error);
        }
        const [status,result]=await this.StudentModel.updateStudent({id:id,input:response.data});
        return res.status(status).json(result);
    }

    deleteStudent=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const result=await this.StudentModel.deleteStudent({id});
        if(result===false){
            return res.status(404).json({message:"Student not found"});
        }else{
            return res.status(200).json({message:"Student deleted"});
        }
        
    }

    disenrollStudentFromCourse=async(req,res)=>{
        const {idStudent,idCourse}=req.params;
        if(idStudent.length!==36 || idCourse.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const [status,result]=await this.StudentModel.disenrollStudentFromCourse({idStudent,idCourse});
        return res.status(status).json(result);
    }
}