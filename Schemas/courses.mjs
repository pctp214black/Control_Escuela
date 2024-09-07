import z from "zod";

const CourseSchema=z.object({
    subject_course:z.string(),
    grade_course:z.number(),
    group_course:z.string(),
    idAdministrative:z.string().uuid()
});

const AttendanceListSchema=z.object({
    idStudent:z.string().uuid(),
    idCourse:z.string().uuid(),
    idAttendance_Status:z.nativeEnum(["presente","ausente","justificado"])
    //date:z.coerce.date().optional()
});

export function validateCourse(input){
    return CourseSchema.safeParse(input);
}

export function validatePartialCourse(input){
    return CourseSchema.partial().safeParse(input);
}

export function validateAttendanceList(input){
    return AttendanceListSchema.safeParse(input);
}

export function validatePartialAttendanceList(input){
    return AttendanceListSchema.partial().safeParse(input);
}