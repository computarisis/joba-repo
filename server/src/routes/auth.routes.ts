
import express, { application } from 'express'
import  jwt  from 'jsonwebtoken'

export const authRouter = express.Router () 
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



//Aux to 
/**
 * GET /api/health
 * Request: no body, no authentication.
 * Success 200: { "ok": true }
 * Error 500: { "error": "Internal server error" }
 */

//Note: if this endpoint is not reachable, req is attended by the catch-all middleware
authRouter.use ( '/api/health', (req, res , next ) => { 
    try {
        res.status (200).json (
            {
                ok: "true", 
                version: envConfig.appVersion
            }
        )
    }
    catch (err)  {
        next (err) 
    }
})


/**
 * POST /api/auth/register-validate
 * Request JSON:
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "name": "User Name" // optional
 * }
 * Success 200:
 * {
 *   "ok": true
 * }
 * Errors:
 *   400 { "error": "Bad request", "details": [...] }
 *   409 { "error": "Email already exists" }
 */

//Note that the email MUST be unique 
//error arg is passed by runtime on awaited promise throwing error 

authRouter.post ('/api/auth/register-validate' , async (req, res)=> {
    //Validate user payload 
    const payload= schemaRegVal.safeParse (req.body)

    //Get the hash for the password 
    //https://www.npmjs.com/package/bcrypt


    if (payload.success) {
        const salt= await bcrypt.genSalt (Number (envConfig.saltRounds)) 
        const hash=  await bcrypt.hash ( req.body.password, salt)
        //Ensure email does not exist (unique) 

        try {
            const result= await pool.query (
                `
                    SELECT * FROM users 
                    WHERE email=$1
                `, [payload.data.email]
            )

            if ((await result).rowCount!=0) {
                res.status (409).json ({error: 'Email already exists'})
                return 
            } 

        }
        catch (error) {
            //DB error 
            console.log ('See DB error', error)
            res.status (500).json ({error: 'Server error'})
            return 
        }

        //Next, generate the token and save to cache; add TTL 

        const token= crypto.randomBytes(32).toString ('base64url')
        const tokHash = crypto.createHash ('SHA256').update (token).digest('hex')
        try {

            const entry= await regCache.save (
                {
                    name: payload.data.name, 
                    email: payload.data.email , 
                    passwordHash: hash , 
                    tokenHash: tokHash
                } 
            )
            if (!entry[EntityId]) throw new Error ()
            await regCache.expire (entry[EntityId], 1440)

            const url = `${envConfig.frontendOrigin}/validate-email#token=${encodeURIComponent(token)}`
            const subjectText= 'Registration'
            await transporter.sendMail (
                {
                    from: `"Joba" <${envConfig.mailUser}>`, 
                    to :  `${payload.data.email}`, 
                    subject: subjectText, 
                    text: `Register link: ${url}`,
                    html : 
                        `
                            <a href= "${url}">  Register </a> 
                        `
                })
            
                res.status (200).json ({ok: true})
        }

        catch (error) {
            //redis error 
            console.log ("See on /auth/register", error)
        }
    
    }
    else {
        res.status (400).json ({error: "bad request"})
    }

} )

/**
 * POST /api/auth/register
 * Request JSON:
 * {
 *   "token": "raw token from reset URL",
 *  
 * }
* Success 201:
 * {
 *   "user": {
 *     "id": "uuid",
 *     "email": "user@example.com",
 *     "name": "User Name or null",
 *     "createdAt": "ISO timestamp"
 *   }
 * }
 * Also sets the HttpOnly JWT cookie.
 * Errors:
 *   400 { "error": "Validation failed", "details": [...] }
 */


authRouter.post ('/api/auth/register', async (req, res)=> {
    //validate  request 
    const payload= schemaReg.safeParse (req.body)

   

    if (!payload.success) {
        res.status (400).json ({error: 'Validation error'})
        return 
    }

    console.log ("Logging request at /auth/register; received, ", payload.data.token)

    //Find hash (token hash is what's stored in the cache)
    const hashed= crypto.createHash ('SHA256').update (payload.data.token).digest('hex') 

    //Validate that hashed token is present in cache  and Retrieve cache user account data
    const cacheRes= await regCache.search().where ('tokenHash').equals (hashed).returnFirst ()

    //Invalid token ; token generated to be UUID 
    if (!cacheRes) {
        console.log ('Invalid token at /auth/register')
        res.status (400).json ({error: 'Validation error'})
        return 
    }

    //Consume token in cache 
    await regCache.remove (cacheRes[EntityId]!)

  
    //Register in DB 
    //https://node-postgres.com/features/queries
    try {

        const result= await pool.query (
            `
                INSERT INTO users (email,password,name)
                VALUES ($1,$2,$3)
                RETURNING id AS id, email AS email, name AS name, created_at AS createdAt
                
            `, 
            [
                cacheRes.email,
                cacheRes.passwordHash, 
                cacheRes.name 
            ]
        ) 
        //Set auth token (cookie) 
        const token= {
            userId: result.rows[0].id
        }
        const jwtToken= jwt.sign (token, envConfig.jwtSignature, {expiresIn: "24hr"})
        res.cookie (envConfig.cookieName, jwtToken, cookieOptions)


        res.status (201). json (
            {
                "user": result.rows[0].id
            }
        )
    }
    catch (error: any) {
        res.status (409).json ({error: "Invalid request format"})
    }
    
})




/**
 * POST /api/auth/login
 * Request JSON:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * Success 200:
 * {
 *   "user": { ... },
 *   "applications": [ ...first 10 applications in createdAt ascending order... ],
 *   "nextCursor": "opaque cursor string or null"
 * }
 *
 * Login always returns the first 10 applications.
 * Later reads continue from nextCursor and let the client choose limit.
 * Also sets the HttpOnly JWT cookie.
 * Errors:
 *   400 { "error": "Validation failed", "details": [...] }
 *   401 { "error": "Invalid email or password" }
 */


//NOTE: Need to invalidate any other active sessions for this user 

authRouter.post ('/api/auth/login', async  (req, res) => {
    //Validate user payload
    const payload= schemaLogIn.safeParse (req.body )

    if (payload.success) {
        try {
            const result= await pool.query (
                `
                    SELECT id, email, name, password AS password FROM users
                    WHERE email=$1
                    
                `, 
                [payload.data.email]
            )

     
            //Validate if any records were found 
            if (!result.rows[0]){
                res.status (401).json ({error: "Invalid email"})
                return 
            }

            const storedPass = result.rows[0].password 
            const match = await bcrypt.compare (req.body.password, storedPass)

            //Validate if password found matches ; then set cookie 
            if (match) {
                const token= {
                    userId: result.rows[0].id 
                }
                const jwtToken= jwt.sign (token, envConfig.jwtSignature, {expiresIn: '24hr'}) 
                res.cookie (envConfig.cookieName,  jwtToken, cookieOptions)

                const resultArg=   await  fetchDbPaylaod (result.rows[0].id , envConfig.defaultloginlim+1)

                res.status (200).json (
                
                    {
                        user: {
                            name: result.rows[0].name,
                            email: result.rows[0].email 
                        },
                        applications: resultArg.applications, 
                        nextCursor: resultArg.nextCursor

                    }
                )
            }
            else {
                res.status (401).json ({error: "Invalid password"})
                return 
            }
        }
        catch (error:any) {
            res.status (400).json ({error: error.message })
        }

    }
    else {
        res.status (400).json ({error: "bad request"})
    }

}) 




/**
 * POST /api/auth/forgot-password
 * Request JSON:
 * { "email": "user@example.com" }
 * Success 200:
 * { "ok": true, "message": "If that email exists, a reset link has been sent." }
 *
 * Security: the response is intentionally the same whether the email exists or not.
 * In development, if SMTP is not configured, the reset URL is printed to the server console.
 */

//TODO: consider redis failures 
authRouter.post ('/api/auth/forgot-password', async (req, res)=> {
    //Validate request format 

    const parsed= schemaforgotPassword.safeParse (req.body)

    //Retrieve userId using email 
    if (!parsed.success) {
        console.log ("Received recovery request --")
        res.status (400).json ({error: 'Invalid request format'})
        return 
    }

    const email = parsed.data.email

    //Note: pg lowercases unquoted aliases 
    try {
        const result= await pool.query (
            `
                SELECT id AS "userId" 
                FROM users
                WHERE email=$1
            `,
            [email]
        )

        if (result.rowCount==0) {
            //Invalid email -- No recovery token sent
            res.status (200).json ({ok: true })
            return 
        } 
        const userIdParam= result.rows[0].userId

        //Avoid RC: ensure no live token is in cache before accepting the request  (IMPORTANT )
        const resCache= await recoveryCache.search () .where ('userId').equals (userIdParam).returnFirst()
        if (resCache) {
            res.status (200).json ({ok: true })
            return 
        }

        //Generate random token 
        const token= crypto.randomBytes (32).toString ('base64url')
        const tokHash= crypto.createHash ('SHA256').update (token).digest ('hex')
        const recPair: RecoveryRecord= {
            userId: userIdParam, 
            tokenHash: tokHash
        } 

        const savedPair= await recoveryCache.save (recPair) 
        await recoveryCache.expire (savedPair[EntityId]!, 5000)

        //Send email using nodemail 
        const url = `${envConfig.frontendOrigin}/change-password#token=${encodeURIComponent(token)}`
        console.log ("Sending recovery to ", url )

        await transporter.sendMail (
            {
                from: `"Joba" <${envConfig.mailUser}> `, 
                to :  `${email}`, 
                subject: "Password recovery", 
                text: `Reset link: ${url}`,
                html : 
                    `
                        <a href= "${url}">  Reset your password </a> 
                    `
            }
        )

        //Send response to client
        res.status (200).json ({ok: true })
    }
    catch (error: any) {
        console.log ("See: ", error)
        res.status (500).json ({error: 'Server error'})
    }
    
})


/**
 * POST /api/auth/reset-verify
 * No authentication cookie required.
 *
 * Request body:
 * { "token": "..." }
 *
 * Success 200 when valid:
 * { "valid": true, "expiresAt": "ISO timestamp" }
 *
 * Success 200 when invalid/expired/used:
 * { "valid": false, "expiresAt": null }
 */
//Not returning timestamp 

authRouter.post ('/api/auth/reset-verify',  async (req, res)=> {
    //Validate request  format 

    const parsed = schemaResetVerify.safeParse (req.body) 
    if (!parsed.success ) {
        return 
    }

    //Hash token before check
    const tokHash= crypto.createHash ('SHA256').update (parsed.data.token).digest ('hex')

    //Validate token is present in cache 
    try {
        const result= await recoveryCache.search().where ('tokenHash').equals (tokHash).returnFirst ()

        if (result){
            //Valid
            res.status (200).json ({valid: true})
        }
        else {
            //TTL Expired  (null result) 
            res.status (200).json ({valid: false })
        }
    }
    catch (error) {
        //Redis error  
        console.log ("See: ", error)
        res.status (500).json ({error: 'Server error'})
    }
})



/*
 * POST /api/auth/reset-password
 * Request JSON:
 * {
 *   "token": "raw token from reset URL",
 *   "newPassword": "newPassword123"
 * }
 * Success 200: { "ok": true }
 * Errors:
 *   400 validation error
 *   400 { "error": "Invalid or expired reset token" }
 */
//NOTE: No auth middleware on this endpoint ; tokens are assumed to be generated as UUID


authRouter.post ('/api/auth/reset-password', async (req, res)=> {

    //Validate request format 
    const parsed= schemaResetPassword.safeParse (req.body) 
    if (!parsed.success) {
        console.log ('Parsing error on /auth/reset-password', parsed.error)
        res.status (400).json ({error: 'Validation error'})
        return 
    }

    console.log ('Entering reset request')
    const pgClient= await pool.connect ()
    try {
         

        //Validate TTL has not expired and retrieve userId 
        const tokHash= crypto.createHash ('SHA256').update (parsed.data.token).digest ('hex')
       
        //Update database --- hash before storing 
        const salt= await bcrypt.genSalt (Number (envConfig.saltRounds)) 
        const hash=  await bcrypt.hash ( parsed.data.newPassword, salt)

        //Recall: Token is unique per user (uuid)
        let keyVal= await recoveryCache.search().where ('tokenHash').equals(tokHash).returnFirst ()
        if (!keyVal) {
            res.status (400).json ({error: "Invalid or expired reset token"})
            return 
        }
        //if (keyVal.length!=1 ) throw new Error ('UUID property violated in token ')
            

        //There must be a single entry
        const userId = keyVal.userId 

        //lock the row first 
        await pgClient.query('BEGIN')
        const userRes= await pgClient.query (
            `
                SELECT id FROM users
                WHERE id=$1
                FOR UPDATE
            `, [userId]
        )

        //User does not exist 
        if (userRes.rowCount==0) {
            await pgClient.query ('ROLLBACK')
            res.status (400).json ({error: 'Validation error'})
            return 
        }

        //Validate inside lock
        keyVal = await recoveryCache.search().where ('tokenHash').equals(tokHash).returnFirst ()
        if (!keyVal) {
            await pgClient.query('ROLLBACK')
            res.status (400).json ({error: "Invalid or expired reset token"})
            return 
        }

        await pgClient.query (
            `
                UPDATE users
                SET password=$1 
                WHERE id=$2
            `
            ,[ hash, userId ]
        )
        //Invalidate cache 
        await recoveryCache.remove (keyVal[EntityId]!)


        await pgClient.query('COMMIT')
        res.status (200).json ({ok: true})
       
    
    }
    catch (error) {
        await pgClient.query ('ROLLBACK')

        //Cache or DB error 
        console.log ("See: ", error)
        res.status (500).json ({error: 'Server error'})
    }
    finally {
        pgClient.release ()
    }

})
 



/**
 * POST /api/auth/logout
 * Request: no body. Cookie may be present.  
 * Success 204: no response body.
 * Clears the authentication cookie.
 */
//This blacklists the token through redis 
//TODO: move times to ENV 

authRouter.post ('/api/auth/logout', async (req, res)=> {
    //Validate request 

    if (!req.jwtCipher) {
        res.status(400).send ()
        return
    } 

    //Retrieve jwt token 
    try {
        const savedCipher= await invalidateCache.save ({
           jwtCipher: req.jwtCipher
        })
        if (!savedCipher[EntityId]) throw new Error ()
        await invalidateCache.expire (savedCipher[EntityId], 1440)

        res.clearCookie (envConfig.cookieName, cookieOptions)
        res.status(204).send ()

        console.log ('logged out client (204)')
    }
    catch {
        //Redis errr 
        res.status (500).json ({error: 'Server error'})
    }
})

/**
 * GET /api/auth/me
 * Request: no body; requires JWT cookie.
 * Success 200:
 * {
 *   "user": {
 *     "id": "uuid",
 *     "email": "user@example.com",
 *     "name": "User Name or null",
 *     "createdAt": "ISO timestamp"
 *   }
 * }
 * Errors:
 *   401 { "error": "Authentication required" }
 *   401 { "error": "Invalid or expired authentication token" }
 *   401 { "error": "User no longer exists" }
 */
//Note: if you have state that directly depends on data asociated with session, 
//you could referech that data without having to relogin which involves getting a new jwt token

//React client uses this endpoint on refocus to validate authentication

authRouter.get ('/api/auth/me',  async (req, res)=> {

   
    try {
        if (! req.userId) throw new Error  ()
        const result= await pool.query (
            `
                SELECT id, email, name, created_at AS createdAt
                FROM users
                WHERE id=$1
                 
            `, [req.userId]
        )
        if (result.rowCount==0){
            res.status (401).json ({error: 'User no longer exists'})
            return 
        }


        res.status (200).json ({
            user: result.rows[0]
        })
    }
    catch {
        res.status (500).json ({error: 'Server error'})

    }
})







