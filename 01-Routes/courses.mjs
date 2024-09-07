import { Router } from "express";
import { createCourseController } from "../03-Controllers/course.mjs";

export function createCourseRouter({CourseModel}){
    const courseController=new createCourseController({CourseModel});
    
    const courseRouter=Router();

    //GETs
    courseRouter.get("/",courseController.getAllCourses);

    courseRouter.get("/:id",courseController.getCourseById);

    //POSTs
    courseRouter.post("/",courseController.createNewCourse);

    courseRouter.post("/attendanceList",courseController.attendanceList);

    //courseRouter.post("/",courseController.putGrades);

    //UPDATEs
    courseRouter.patch("/:id",courseController.updateCourse);

    //courseRouter.patch("/",courseController.attendanceList);

    //courseRouter.patch("/",courseController.updateGrades);

    //DELETEs
    courseRouter.delete("/:id",courseController.deleteCourse);

    return courseRouter;
}

