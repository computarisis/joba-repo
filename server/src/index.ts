import "dotenv/config";
import express, {
  type ErrorRequestHandler,  //Used for error handler middleware
  type RequestHandler
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { createHash, randomBytes } from "node:crypto";
import { Pool, type QueryResultRow } from "pg";

import {createClient} from 'redis'
import {recoverySchema, regValSchema,  invalidateSchema} from './redis.js'
import {Repository} from 'redis-om'



import {apiRouter} from './routes/application.routes.js'
import {authRouter} from './routes/auth.routes.js'
import {userToken} from './shared.js'
const app= express ( ) 

type configObj = {
  cookieName: string, 
  jwtSignature: string, 
  frontendOrigin: string, 
  saltRounds: string, 
  appVersion: string, 
  port : string, 
  dbUrl : string,
  defaultloginPayloadSize: number ,
  redisUrl: string, 
  mailSecret: string , 
  mailUser: string, 
  mailHost: string
  systemEnv: string

}
if (! process.env.COOKIE_NAME  ) {
  throw new Error ("Env variable missing")
}
if (! process.env.JWT_SECRET) {
  throw new Error ("Env variable missing")
}
if (! process.env.FRONTEND_ORIGIN) {
  throw new Error ("Env variable missing")
}
if (! process.env.SALT_ROUNDS) {
  throw new Error ("Env variable missing")
}
if (! process.env.APP_VERSION) {
  throw new Error ("Env variable missing")
}
if (! process.env.PORT) {
  throw new Error ("Env variable missing")
}
if (! process.env.DATABASE_URL) {
  throw new Error ("Env variable missing")
}
if (! process.env.DEFAULT_lOGIN_PAYLOAD_SIZE) {
  throw new Error ("Env variable missing")
}
if (! process.env.REDIS_URL) {
  throw new Error ("Env variable missing")

}
if (! process.env.PASS_SECRET) {
  throw new Error ("Env variable missing")
}
if (! process.env.MAIL_USER) {
  throw new Error ("Env variable missing")
}
if (! process.env.MAIL_HOST) {
  throw new Error ("Env variable missing")
}if (! process.env.NODE_ENV) {
  throw new Error ("Env variable missing")
}

export const envConfig= {
  cookieName: process.env.COOKIE_NAME, 
  jwtSignature: process.env.JWT_SECRET, 
  frontendOrigin: process.env.FRONTEND_ORIGIN, 
  saltRounds: process.env.SALT_ROUNDS, 
  appVersion: process.env.APP_VERSION, 
  port: process.env.PORT, 
  dbUrl: process.env.DATABASE_URL,
  defaultloginPayloadSize: Number (process.env.DEFAULT_lOGIN_PAYLOAD_SIZE), 
  redisUrl: process.env.REDIS_URL,
  mailSecret: process.env.PASS_SECRET,
  mailUser: process.env.MAIL_USER, 
  mailHost: process.env.MAIL_HOST,
  systemEnv: process.env.NODE_ENV

} as configObj




//Create redis client 
export const redisClient= createClient (
  {
      url: envConfig.redisUrl
  }
)
await redisClient.connect ()

//https://nodemailer.com/

export const transporter= nodemailer.createTransport ({
  host: envConfig.mailHost,
  port: 587, 
  secure: false,
  auth: {
    user: envConfig.mailUser, 
    pass: envConfig.mailSecret
  },
})


try {
  await transporter.verify ()
  console.log ("Transporter is verified")
}
catch (err) {
  console.log ("Transporter error ", err )
}

export const recoveryCache= new Repository (recoverySchema, redisClient)
export const regCache= new Repository (regValSchema, redisClient)
export const invalidateCache= new Repository (invalidateSchema, redisClient)

await recoveryCache.createIndex ()
await regCache.createIndex () 
await invalidateCache.createIndex ()


/*

  Syntax Notes: 
  -------------------------------------
  let rec= {
    userId: 1,
    tokenHash: 'bb
  } as typeof recoverySchema.entity 

  create index 

  await recoveryCache.save (
    {
      userId: 1,
      tokenHash: 'bb
    }
  )
  const result= recoveryCache.search(). where ('userId').equals ().where ('tokenHash').equals (). return.all ()
  if (result.length==0)  //NOT found 

  //Caching full object 
  recoveryCache.expire ( rec,  900)

*/



//Add middleware --CORS
app.use (cors ({
  origin: envConfig.frontendOrigin, 
  credentials: true
}))
//-- Cookies 
app.use (cookieParser ())

//Add security middleware -- Adds headers against clickjacking (CSP), XSS
app.use (helmet())
app.use (express.json ())


//https://expressjs.com/en/resources/middleware/cookie-parser/
export const authHandler : RequestHandler =   async (req, res, next )=> {
  //First, retrieve cookie 
  
  const cookieToken=  req.cookies?.[envConfig.cookieName] 

  //missing cookie 
  if (!cookieToken) {
    res.status (401).json ({error: 'Invalid token'})
    return 
  }
  try {

    //This returns a userToken type
    const decode= jwt.verify (cookieToken, envConfig.jwtSignature) as  userToken

    //Set userId on the request 
    req.userId=  decode.userId 

    //Set jwt string on the request (encoded)
    req.jwtCipher= cookieToken

    //Ensure jwt token is not blacklisted  
    const result= await invalidateCache.search().where ('jwtCipher').equals (cookieToken).returnFirst()
    if (result) {
      throw new Error ('Invalid token ')
    }

    next()
  }

  catch {
      //Auth issue 
      res.status (401).json ({error: 'Invalid token'})
  }

} 
app.use ('/api/applications', authHandler)
app.use ('/api/auth/me', authHandler)
app.use ('/api/auth/logout', authHandler)

//Connection pool 
export const pool = new Pool (
  {
    connectionString: process.env.DATABASE_URL, 
    max:10, 
    keepAlive: true
  }
) 


//https://www.postgresql.org/docs/current/ddl-generated-columns.html
//https://www.postgresql.org/docs/current/ddl.html

//Database Schema/Migration 
//Note: pg uses snake case naming convention for the columns 
//Tables: users (id, name, email, password); 
//        applications (id, userId(fk), company, role, status, application_date, job_url, 
//                     salary_min, salary_max, notes, created_at, updated_at )


//Email MUST be unique 
async function migrate  () {
  await pool.query (
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR (100), 
        email VARCHAR (100) NOT NULL UNIQUE, 
        password VARCHAR (255) NOT NULL, 
        created_at TIMESTAMPTZ(3) NOT NULL DEFAULT NOW()
    );
      
     CREATE TABLE IF NOT EXISTS applications (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INTEGER REFERENCES users (id), 
        company VARCHAR (100) NOT NULL , 
        role VARCHAR (100) NOT NULL, 
        status VARCHAR (30) NOT NULL, 
        application_date DATE, 
        job_url VARCHAR (100), 
        salary_min FLOAT (24), 
        salary_max FLOAT (24), 
        notes TEXT, 
        created_at TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(), 
        updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT NOW()
     ); 
     CREATE INDEX IF NOT EXISTS IDX_GETAPPS  ON  applications (user_id, created_at, id)
    `
  )
}

await migrate ()



//Add routes 
app.use ('', authRouter)
app.use  ('', apiRouter)


//error handling 
let errorHandler: ErrorRequestHandler = (err, req, res, next )=> {
  console.log (err.message)
  console.log ("See-- errorHandler")
  res.status(500).json ({error: err.message})
}
//Add error handler 
app.use (errorHandler )


//Start server 
app.listen (Number (envConfig.port), "0.0.0.0", ()=> {console.log ("Starting server ... ")})