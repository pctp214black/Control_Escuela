import z,{ string } from "zod";

const administrativeSchema=z.object({
    first_name:z.string().max(255,{message:"Must be 255 or fewer characters long"}),
    last_first_name:z.string().max(255,{message:"Must be 255 or fewer characters long"}),
    last_second_name:z.string().refine((value)=>value.length<=255 || value==="",{
        message:"last_second_name must be 255 characters long or less"
    }).default(""),
    email:z.string().email({message:"Invalid email address"}),
    password:z.string({message:"Must be a string"}),
    telephone:z.string({message:"Must be a string"}).refine((value)=>value.length === 10 || value === "",{
        message: "Telephone must be 10 characters long or empty"
    }).default(""),
    status:z.enum(["activo","baja","suspendido"]).optional(),
    occupation:z.array(z.enum(["director","maestro"]))
});

export function validateAdministrative(input){
    return administrativeSchema.safeParse(input);
}

export function validatePartialAdministrative(input){
    return administrativeSchema.partial().safeParse(input);
}