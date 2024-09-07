import express, { json } from "express";
import { createStudentRouter } from "./01-Routes/students.mjs";
import { createAdministrativeRouter } from "./01-Routes/administratives.mjs";
import { createCourseRouter } from "./01-Routes/courses.mjs";

export function createNewApp({StudentModel,AdministrativeModel,CourseModel}){
    const app=express();

    app.use(json());

    app.disable('x-powered-by')

    app.use("/students",createStudentRouter({StudentModel:StudentModel}));

    app.use("/administratives",createAdministrativeRouter({AdministrativeModel:AdministrativeModel}));

    app.use("/courses",createCourseRouter({CourseModel:CourseModel}));

    const PORT=process.env.PORT ?? 1234;

    app.listen(PORT,()=>{
        console.log(`Server listenning on http://localhost:${PORT}`);
    });
}
