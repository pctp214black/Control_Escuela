import { Router } from "express";
import { createAdministrativeController } from "../03-Controllers/administrative.mjs";

export function createAdministrativeRouter({AdministrativeModel}){
    const administrativeController=new createAdministrativeController({AdministrativeModel});
    
    const administrativesRouter=Router();

    //GETs
    administrativesRouter.get("/",administrativeController.getAllAdministratives);

    administrativesRouter.get("/:id",administrativeController.getAdministrativeById);

    //POSTs
    administrativesRouter.post("/",administrativeController.createNewAdministrative);

    //UPDATEs
    administrativesRouter.patch("/:id",administrativeController.updateAdministrative);

    //DELETEs
    administrativesRouter.delete("/:id",administrativeController.deleteAdministrative);

    return administrativesRouter;
}