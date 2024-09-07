import { validateCourse,validatePartialCourse,validateAttendanceList,validatePartialAttendanceList } from "../Schemas/courses.mjs";


export class createCourseController{
    constructor({CourseModel}){
        this.CourseModel=CourseModel;
    }

    //Obtener todos los alumnos
    getAllCourses=async (req,res)=>{
        const status=req.query;
        const allCourses=await this.CourseModel.getAllCourses({status});
        return res.status(200).json(allCourses);
    }

    //Obtener alumno por ID
    getCourseById=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const Course=await this.CourseModel.getCourseById({id:id});
       /* if(Course.length===0){
            return res.status(404).json({message:"Course not found"});
        }*/
        return res.status(200).json(Course);
    }

    //Crear un nuevo alumno
    createNewCourse=async(req,res)=>{
        const response=validateCourse(req.body);
        if(response.success===false){
            return res.status(400).json({message:response.error});
        }
        const newCourse=await this.CourseModel.createNewCourse({input:response.data});
        return res.status(201).json(newCourse);
    }

    attendanceList=async(req,res)=>{
        const response=validateAttendanceList(req.body);
        console.log(response.data);
        return;
        if(response.success===false){
            return res.status(400).json({message:response.error});
        }
        const putAttendance=await this.CourseModel.attendanceList({input:response.data});

        
    }

    updateCourse=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const response=validatePartialCourse(req.body);
        if(response.success===false){
            return res.status(400).json(response.error);
        }
        const [status,result]=await this.CourseModel.updateCourse({id:id,input:response.data});
        return res.status(status).json(result);
    }

    deleteCourse=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const result=await this.CourseModel.deleteCourse({id});
        if(result===false){
            return res.status(404).json({message:"Course not found"});
        }else{
            return res.status(200).json({message:"Course deleted"});
        }
        
    }
}