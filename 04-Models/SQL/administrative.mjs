import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection=await mysql2.createConnection({
    database:"control_escuela_bd",
    host:"localhost",
    user:"root",
    password:process.env.SQL_PASSWORD,
    port:"3306"
});

export class AdministrativeModel{
    static async getAllAdministratives({status}){
        if(Object.keys(status).length !== 0){
            let occupation=[];
            let spaces=[];
            for(let valor in status){
                occupation.push(status[valor].toLowerCase());
                spaces.push("?");
            }
            const [allAdministrativesStatus]=await connection.query(
                `SELECT 
                BIN_TO_UUID(Administrative.idAdministrative) AS id,
                first_name,
                last_first_name,
                last_second_name,
                email,
                password,
                telephone,
                (SELECT status FROM Status WHERE Status.idStatus = Administrative.idStatus) AS status
            FROM 
                Administrative
            INNER JOIN 
                Administrative_has_Occupation ON Administrative.idAdministrative = Administrative_has_Occupation.idAdministrative
            WHERE 
                Administrative_has_Occupation.idOccupation IN (
                    SELECT idOccupation FROM Occupation WHERE occupation IN (${spaces.join(",")})
                )
            GROUP BY
                Administrative.idAdministrative;`,
                [...occupation]
            ); 
            return allAdministrativesStatus;
        }
        const [allAdministratives]=await connection.query(
            `SELECT 
            BIN_TO_UUID(Administrative.idAdministrative) AS id,
            first_name,
            last_first_name,
            last_second_name,
            email,
            password,
            telephone,
            (SELECT status FROM Status WHERE Status.idStatus = Administrative.idStatus) AS status,
            GROUP_CONCAT(Occupation.occupation) AS occupation
            FROM 
                Administrative
            INNER JOIN 
                Administrative_has_Occupation ON Administrative.idAdministrative = Administrative_has_Occupation.idAdministrative
            INNER JOIN 
                Occupation ON Administrative_has_Occupation.idOccupation = Occupation.idOccupation
            GROUP BY
                Administrative.idAdministrative;`
        );
        return allAdministratives;
    }
    static async getAdministrativeById({id}){
        const [Administrative]=await connection.query(
            `SELECT 
            BIN_TO_UUID(Administrative.idAdministrative) AS id,
            first_name,
            last_first_name,
            last_second_name,
            email,
            password,
            telephone,
            Status.status,
            GROUP_CONCAT(Occupation.occupation) AS occupation
            FROM 
                Administrative
            INNER JOIN 
                Administrative_has_Occupation ON Administrative.idAdministrative = Administrative_has_Occupation.idAdministrative
            INNER JOIN 
                Occupation ON Administrative_has_Occupation.idOccupation = Occupation.idOccupation
            INNER JOIN 
                Status ON Status.idStatus = Administrative.idStatus
            WHERE 
                Administrative.idAdministrative = UUID_TO_BIN(?)
            GROUP BY
                Administrative.idAdministrative;`,
            [id]
        );

        return Administrative;
    }

    static async createNewAdministrative({input}){
        const{
            first_name,
            last_first_name,
            last_second_name,
            email,
            password,
            telephone,
            occupation
        }=input;
        const [uuidResult]=await connection.query("SELECT UUID() uuid");
        const [{uuid}]=uuidResult;
        await connection.query(
            `INSERT INTO Administrative(idAdministrative,first_name,last_first_name,last_second_name,email,password,telephone,idStatus) values
            (UUID_TO_BIN(?),?,?,?,?,?,?,(Select idStatus from Status where status="Activo"));`,
            [uuid,first_name,last_first_name,last_second_name,email,password,telephone]
        );
        for(let asign of occupation){
            await connection.query(
                `insert into Administrative_has_Occupation(idAdministrative,idOccupation) values
                (UUID_TO_BIN(?),(SELECT idOccupation From Occupation where occupation=?));`,
                [uuid,asign]
            );
        }
        
        const [Administrative]=await connection.query(
            `Select BIN_TO_UUID(idAdministrative) id,first_name,last_first_name,last_second_name,email,password,telephone,(Select status from Status where Status.idStatus=Administrative.idStatus)status
            FROM Administrative
            Where idAdministrative=UUID_TO_BIN(?);`,
            [uuid]
        )
        return Administrative;
    }

    static async updateAdministrative({id,input}){
        let columns=[];
        let updates=[];
        let occupations=undefined;
        for(let column in input){
            
            if(column==="status"){
                columns.push(`idStatus=?`);
                const [[s]]=await connection.query(`
                    select idStatus from Status where status=?;`,
                    [input[column]]    
                );
                const {idStatus}=s;
                updates.push(idStatus);
            }else if(column==="occupation"){
                occupations=input[column];
            }else{
                columns.push(`${column}=?`);
                updates.push(input[column]);
            }
            
        }
        if(occupations){
            const [result]=await connection.query(
                `Delete 
                from Administrative_has_Occupation
                where idAdministrative=UUID_TO_BIN(?)`,
                [id]
            );
            if(result.affectedRows!==0){
                for(let asign of occupations){
                    await connection.query(
                        `insert into Administrative_has_Occupation(idAdministrative,idOccupation) values
                        (UUID_TO_BIN(?),(SELECT idOccupation From Occupation where occupation=?));`,
                        [id,asign]
                    );
                }
            }
        }
        if(columns.length!==0){
            updates.push(id);
            const [AdministrativeUpdate]=await connection.query(
                `UPDATE Administrative Set ${columns.join(",")} where idAdministrative=UUID_TO_BIN(?)`,
                [...updates]
            )
            if(AdministrativeUpdate.affectedRows===0){
                return [404,{message:"Administrative not found"}];
            }
        }
        const [updateAdministrative]=await AdministrativeModel.getAdministrativeById({id});
        return [200,updateAdministrative];
    }

    static async deleteAdministrative({id}){
        const [result]=await connection.query(
            `DELETE 
            FROM Administrative_has_Occupation
            Where idAdministrative=UUID_TO_BIN(?);`,
            [id]
        );
        if(result.affectedRows==0){
            return false;
        }
        await connection.query(
            `DELETE 
            FROM Administrative
            Where idAdministrative=UUID_TO_BIN(?);`,
            [id]
        );
        return true;
    }
}