


import express, { application } from 'express'
import  jwt  from 'jsonwebtoken'


export const apiRouter = express.Router () 
import {schemaRegVal, schemaReg, schemaPostApplication, schemaPatchApplication,  schemaCursor, schemaAuthToken, schemaLogIn, 
    schemaPostApplicationType, schemaPatchApplicationType, 
    applicationRow, cursorObj, applicationQuery, schemaCursorType, 
    schemaforgotPassword, schemaResetVerify, schemaResetPassword
} from '../schema.js'
import {invalidateCache, pool} from '../index.js'
import bcrypt from "bcryptjs";

import { envConfig } from '../index.js'
import {
    type RequestHandler
} from "express";
import { z } from 'zod';
import { setDefaultResultOrder } from 'node:dns'

import { recoverySchema, regValSchema , invalidateSchema,  RecoveryRecord, RegValRecord } from '../redis.js'
import {recoveryCache, regCache, transporter} from '../index.js'
import {EntityId} from 'redis-om'
import crypto from 'crypto'

import { 
    userToken, 
    userRecord, 
    cookieOptions, 
    dbFieldsMapping, 
    applicationSelect, 
    decodeCursorOjb, 
    encodeCursorObj, 
    retrieveOptData,
    retrievePatchData,
    fetchDbPaylaod

 } from '../shared.js'



/**
 * GET /api/applications
 * Request: no body; requires JWT cookie.
 * Optional query parameters:
 *   search=google
 *   status=saved|applied|interview|offer|rejected
 *   cursor=<opaque cursor returned by the previous request>
 *   limit=10   // max 100
 *
 * Success 200:
 * {
 *   "applications": [ ... ],
 *   "nextCursor": "opaque cursor string or null"
 * }
 *
 * Ordering is fixed and deterministic:
 *   created_at ASC, id ASC
 *
 * First request: omit cursor.
 * Later requests: send the previous response's nextCursor.
 * nextCursor is null when there are no more records.
 *
 * If search/status changes, restart from the beginning by omitting cursor.
 * Errors:
 *   400 { "error": "Invalid query", "details": [...] }
 *   400 { "error": "Invalid cursor" }
 *   401 authentication errors
 */








apiRouter.get ('/api/applications', async (req, res)=> {

    const userId= req.userId 

    //Retrieve cursor 
    const cursor = req.query?.cursor as string | undefined 
  

    //Extract limit 
    let limit= Number (req.query?.limit )

    if (req.query?.limit== undefined || !Number.isInteger (limit) || limit==0) {
        res.status(400).json ({error: 'Invalid query', details: 'Invalid limit parameter'})
        return 
    }
  
  
    limit+=1 
    let cursorJson
    try {
        if (cursor) cursorJson = decodeCursorOjb (cursor)
    }
    catch {
        res.status (400).json ({error: 'Invalid cursor'})
        return 
    }
    
    //Validate payload structure 
    let cursorPayload
    if (cursor) {
         cursorPayload= schemaCursor.safeParse (cursorJson)

        if (!cursorPayload.success) {
            res.status (400).json ({error: 'Invalid cursor'})
            return 
        }
    }
    

    //Request one entry ahead  to establish the next cursor 
    //Retrieving records WHERE (id, created_at)> cursor for userId ; Index speeds up search 
    let nextCursorParam = null 
    try {
    
        const result = await (cursor? fetchDbPaylaod (userId!, limit, cursorPayload!.data): fetchDbPaylaod (userId!, limit)) 
        res.status(200).json ({
            applications: result.applications,
            nextCursor: result.nextCursor
        })
    }
    catch (error: any ){ //SEE
        res.status (500).json ({error: "DB error on request"})
    }
})




/**
 * POST /api/applications
 * Request JSON:
 * {
 *   "company": "Google",                 // required
 *   "role": "Frontend Engineer",         // required
 *   "status": "applied",                 // optional; defaults to "saved" (required)
 *   "applicationDate": "2026-07-30",     // optional or null
 *   "jobUrl": "https://example.com/job", // optional or null
 *   "salaryMin": 100000,                 // optional or null
 *   "salaryMax": 140000,                 // optional or null
 *   "notes": "Applied online"            // optional or null
 * }
 * Requires JWT cookie.
 * Success 201:
 *   { "application": { ...created application fields... } }
 * Errors:
 *   400 { "error": "Validation failed", "details": [...] }
 *   401 authentication errors
 */
//500 Added

apiRouter.post ('/api/applications', async (req,res) => {
    //Validate request 
    const parsed= schemaPostApplication.safeParse (req.body )

    console.log ("Entering endpoint (post) at /api/applications")
    if (req.userId== undefined) {
        console.log ("See --- userId is undefined")
        throw new Error () 
        return 
    }

  
    if (parsed.success){

        if (parsed.data == undefined) {
            console.log ("------")
            res.status (400).json ({error: "Validation failed"})
            return 
        }

        const [appStr, valStr, listItems]= retrieveOptData (req.userId, parsed.data)

        console.log ("---Inside---")

        try {
            const result= await pool.query (
                `
                    INSERT INTO applications (${appStr})
                    VALUES (${valStr})
                    RETURNING id, user_id, company, role, status, application_date AS applicationDate, 
                        job_url AS jobUrl, salary_min AS salaryMin, salary_max AS salaryMax, notes, 
                        created_at AS createdAt, updated_at AS updatedAt
                    
                `, 
                listItems
            )
            res.status (201).json ({
                application: result.rows[0]
            })
        }
        catch {
            console.log ("---Server error---")
            res.status (500).json ({error: 'Server error'})
        }
       
    }
    else {
        res.status (400).json ({error: "Validation failed", details: "Invalid request"})
        console.log (parsed.error)
    }
})




/**
 * PATCH /api/applications/:id
 * Request:
 *   :id = application UUID in the URL
 *   requires JWT cookie
 *   JSON body contains only fields being changed
 * Example request JSON:
 * {
 *   "status": "interview",
 *   "notes": "Interview next Monday"
 * }
 * Allowed body fields:
 *   company, role, status, applicationDate, jobUrl,
 *   salaryMin, salaryMax, notes
 * Success 200:
 *   { "application": { ...updated application fields... } }
 * Errors:
 *   400 { "error": "Invalid application id" }
 *   400 { "error": "Validation failed", "details": [...] }
 *   401 authentication errors
 *   404 { "error": "Application not found" }
 */

// 500 Added
//TODO: Handle empty case 
apiRouter.patch ('/api/applications/:id', async (req, res)=> {

    //Validate request
    const parsed= schemaPatchApplication.safeParse (req.body )

    //Validation application id 
    let appId= Number (req.params.id )
    let userId= req.userId

    if (!Number.isInteger (appId)) {
        res.status (400).json ({error: "Invalid application id"})
        return 
    }

    if (req.userId== undefined) {
        throw new Error () 
    }


    if (parsed.success) {
   
        const [ valStr, userParam, listItems, returnStr]= retrievePatchData (req.userId, parsed.data)

        //RETURNING ${returnStr}   Changing query for RDC normalization (needs id, at least)
        try {
            const result = await pool.query (
                `
                    UPDATE applications SET ${valStr} 
                    WHERE user_id=$${userParam} AND id=${appId}
                    
                    RETURNING id, user_id, company, role, status, application_date AS applicationDate, 
                    job_url AS jobUrl, salary_min AS salaryMin, salary_max AS salaryMax, notes, 
                    created_at AS createdAt, updated_at AS updatedAt
        
                `
                , listItems
            )
            if (result.rowCount==0) {
                res.status (404).json ({error: 'Application not found'})
                return 
            }

            res.status (200).json ({
                application : result.rows[0]
            })
        }
        catch {
            res.status (500).json ({error: 'Server error'})
        }
    }
    else {
       res.status (400).json  ({error: 'Validation failed'})
    }

})



/**
 * DELETE /api/applications/:id
 * Request:
 *   :id = application UUID in the URL
 *   no body
 *   requires JWT cookie
 * Success 204: no response body.
 * Errors:
 *   400 { "error": "Invalid application id" }
 *   401 authentication errors
 *   404 { "error": "Application not found" }
 */


apiRouter.delete ('/api/applications/:id', async (req, res)=> {
    //Validate 
    let userId= req.userId
    let appId= Number(req.params.id )
    

    if (!Number.isInteger ( appId )) {
        res.status (400).json ({error: "Invalid application id"})
        return 
    }

    try {

        const result = await pool.query ( 
            `
                DELETE FROM applications WHERE id=$1 AND user_id=$2
            `, 
            [appId, userId]
        )
        if (result.rowCount==0) {
            res.status (404).json ({error: "Application not found "})
            return 
        }

        res.status (204).send ()
   

    }
    catch {
        res.status (500).json ({error: "DB error"})
    }
    
})
