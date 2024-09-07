import { Router } from "express";
import { createStudentController } from "../03-Controllers/student.mjs";

export function createStudentRouter({StudentModel}){
    const studentController=new createStudentController({StudentModel});
    
    const studentsRouter=Router();

    //GETs
    studentsRouter.get("/",studentController.getAllStudents);

    studentsRouter.get("/:id",studentController.getStudentById);

    //POSTs
    studentsRouter.post("/",studentController.createNewStudent);

    studentsRouter.post("/course",studentController.enrollStudentInCourse);

    //UPDATEs
    studentsRouter.patch("/:id",studentController.updateStudent);

    //DELETEs
    studentsRouter.delete("/:id",studentController.deleteStudent);

    studentsRouter.delete("/:idStudent/course/:idCourse",studentController.disenrollStudentFromCourse);

    return studentsRouter;
}

