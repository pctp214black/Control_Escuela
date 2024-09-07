import { StudentModel } from "./04-Models/SQL/students.mjs";
import { AdministrativeModel } from "./04-Models/SQL/administrative.mjs";
import { CourseModel } from "./04-Models/SQL/courses.mjs";
import { createNewApp } from "./app.mjs";

createNewApp({StudentModel:StudentModel,AdministrativeModel:AdministrativeModel,CourseModel:CourseModel});