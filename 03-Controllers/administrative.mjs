import { validateAdministrative,validatePartialAdministrative } from "../Schemas/administrative.mjs";

export class createAdministrativeController{
    constructor({AdministrativeModel}){
        this.AdministrativeModel=AdministrativeModel;
    }

    //Obtener todos los alumnos
    getAllAdministratives=async (req,res)=>{
        const status=req.query;
        const allAdministratives=await this.AdministrativeModel.getAllAdministratives({status});
        if(allAdministratives[0].occupation){
            allAdministratives.map((resultado)=>{
                resultado.occupation=resultado.occupation.split(",");
            })
        }    
        return res.status(200).json(allAdministratives);
        
    }

    //Obtener alumno por ID
    getAdministrativeById=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const Administrative=await this.AdministrativeModel.getAdministrativeById({id:id});
        Administrative.map((resultado)=>{
            resultado.occupation=resultado.occupation.split(",");
        })
        
        return res.status(200).json(Administrative);
    }

    //Crear un nuevo alumno
    createNewAdministrative=async(req,res)=>{
        const response=validateAdministrative(req.body);
        if(response.success===false){
            return res.status(400).json({message:response.error});
        }
        const newAdministrative=await this.AdministrativeModel.createNewAdministrative({input:response.data});
        return res.status(201).json(newAdministrative);
    }

    updateAdministrative=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const response=validatePartialAdministrative(req.body);
        if(response.success===false){
            return res.status(400).json(response.error);
        }
        const [status,result]=await this.AdministrativeModel.updateAdministrative({id:id,input:response.data});
        if(result.occupation){
            result.occupation=result.occupation.split(",");
        } 
        return res.status(status).json(result);
    }

    deleteAdministrative=async(req,res)=>{
        const {id}=req.params;
        if(id.length!==36){
            return res.status(400).json({message:"Invalid ID lenght. Must be 36"});
        }
        const result=await this.AdministrativeModel.deleteAdministrative({id});
        if(result===false){
            return res.status(404).json({message:"Administrative not found"});
        }else{
            return res.status(200).json({message:"Administrative deleted"});
        }
        
    }
}