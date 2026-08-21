


import express, { application } from 'express'
import  jwt  from 'jsonwebtoken'
export const apiRouter = express.Router () 
import {schemaRegVal, schemaReg, schemaPostApplication, schemaPatchApplication,  schemaCursor, schemaAuthToken, schemaLogIn, 
    schemaPostApplicationType, schemaPatchApplicationType, 
    applicationRow, cursorObj, applicationQuery, schemaCursorType, 
    schemaforgotPassword, schemaResetVerify, schemaResetPassword
} from './schema.js'
import {invalidateCache, pool} from './index.js'



//Auth middleware 
export type userToken= {
    userId: number 
}

export type userRecord= {
    id: number,
    email : string,
    name: string,
    createdAt: string
}

//https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
declare global {
    namespace Express {
        export interface Request {
            userId?: number, 
            jwtCipher?: string

        }
    }
}

export const cookieOptions = {
    maxAge: 900000000, //we use Redis to cache invalid tokens for this TTL max 
    httpOnly: true,  //mitigates stealing via XSS
    secure: true, //forces https
    sameSite: 'strict', //mitigates CSFR
   
} as const 



export const  dbFieldsMapping= {
    //userId: 'user_id',
    company:'company',
    role: 'role',
    status: 'status',
    applicationDate: 'application_date', 
    jobUrl: 'job_url',
    salaryMin: 'salary_min',
    salaryMax: 'salary_max',
    notes: 'notes'
}

//Note these need to be quoted to preserver camel case at runtime
export const applicationSelect  =
`
    id,
    company, 
    role, 
    status, 
    application_date AS "applicationDate", 
    job_url AS "jobUrl", 
    salary_min AS "salaryMin", 
    salary_max AS "salaryMax", 
    notes, 
    created_at AS "createdAt", 
    updated_at AS "updatedAt"
`


export const decodeCursorOjb = (payload : string) : cursorObj => {
    const str= Buffer.from (payload, 'base64url').toString ('utf-8')
    
    try {
       const dec= JSON. parse (str) as cursorObj
       console.log ("See decoded cursor: ", dec)
       return dec
        
    }
    catch (error:any) {
        console.log ("See cursor decode error-- ", error.message)
        throw new Error ()
    } 
}
export const encodeCursorObj = (payload: cursorObj): string => {

    const str= Buffer.from (JSON.stringify (payload)).toString ('base64url')
    console.log ("See encoded cursor: ", str)
    return  str 
}

export const retrieveOptData = (userId: number, parsed: schemaPostApplicationType) : [string, string, unknown[] ]=> {

    const listCond=[]
    const listVals= []
    const listItems :  unknown[] =[]

    listCond.push ('user_id')
    let keyPos= listCond.length 
    listVals.push (`$${keyPos}`) 
    listItems.push (userId)

    for ( const key of  Object.keys (parsed)) {
        if (key in dbFieldsMapping ) {

            listCond.push (dbFieldsMapping[key as keyof typeof parsed])
            let keyPos= listCond.length 
            listVals.push (`$${keyPos}`) //parsed.data[key as keyof typeof parsed.data]

            listItems.push (parsed [key  as keyof typeof dbFieldsMapping])
        }
    }

    const appStr= listCond.join (' , ')
    const valStr= listVals.join (' , ')

    return [appStr, valStr, listItems]

}



export const retrievePatchData = (userId: number, parsed: schemaPatchApplicationType) : [string, number, unknown[] , string]=> {

  
    const listVals= []
    const mappedVals= []
    const listItems :  unknown[] =[]
    let pos=0

   

    for ( const key of  Object.keys (parsed)) {
        if (key in dbFieldsMapping ) {

            let mappedKey= dbFieldsMapping[key as keyof typeof parsed]
            let keyVal = parsed [key  as keyof typeof dbFieldsMapping]
            

  
            let keyPos= pos+=1
            listVals.push (`${mappedKey}=$${keyPos}`)  
            mappedVals.push (`${mappedKey} AS ${key}`)
            listItems.push (keyVal)
        }
    }

    pos+=1 
    listItems.push (userId)

    const valStr= listVals.join (' , ')
    const returnStr= mappedVals.join (' , ')
    return [ valStr,pos,  listItems, returnStr]

}



//Missing cursor: starts from earliest record 
export const fetchDbPaylaod = async (userId: number, limit: number, cursorPayload?: schemaCursorType ): Promise<applicationQuery>=> {

    try{
        let nextCursorParam =null 
        let result 
        if (!cursorPayload) {
            result = await pool.query<applicationRow> (
                `
                    SELECT ${applicationSelect} FROM applications 
                    WHERE user_id=$1 
                    ORDER BY created_at ASC, id ASC
                    LIMIT $2
                
                `, 
                [userId, limit]
            )
        }
        else {
            result = await pool.query<applicationRow> (
                `
                    SELECT ${applicationSelect} FROM applications 
                    WHERE user_id=$1 AND (created_at, id)> ($2, $3)
                    ORDER BY created_at ASC, id ASC
                    LIMIT $4
                
                `, 
                [userId, cursorPayload.createdAt, cursorPayload.id, limit]
            )
        }
        
        const limReturned= result.rows.length 
        let selLimit= result.rows.length 

        //limit MUST be >= 2 since query param is >= 1 
        if (limit<2) throw new Error ('Invalid limit value on server ')

        if (limReturned == limit) {
        
            nextCursorParam = encodeCursorObj 
            ({ 
                id: result.rows[limReturned-2]!.id, 
                createdAt: result.rows[limReturned-2]!.createdAt
            })
            selLimit-=1
        }


        return  ({
            applications: result.rows.slice (0, selLimit), 
            nextCursor: nextCursorParam
        })
    }
    catch {
        throw new Error ()
    }
}
