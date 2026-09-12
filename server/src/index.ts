
import express, {
  type ErrorRequestHandler,  //Used for error handler middleware
  type RequestHandler
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import {recoverySchema, regValSchema,  invalidateSchema} from './redis.js'
import {Repository} from 'redis-om'

import {apiRouter} from './routes/application.routes.js'
import {authRouter} from './routes/auth.routes.js'
import {userToken} from './shared.js'
import { envConfig } from "./config.js";
import { redisClient } from "./redis.js";
import { transporter } from "./mailer.js";
import { recoveryCache, modifyIndices, regCache, invalidateCache } from "./redis.js";
import { migrate } from "./migrate.js";


async function start () {
  await redisClient.connect ()
  try {
    await transporter.verify ()
    console.log ("Transporter is verified")
  }
  catch (err) {
    console.log ("Transporter error ", err )
  }


  await modifyIndices ( recoveryCache, recoverySchema); 
  await modifyIndices (regCache, regValSchema); 
  await modifyIndices (invalidateCache, invalidateSchema); 
  
  await recoveryCache.createIndex ()
  await regCache.createIndex () 
  await invalidateCache.createIndex ()
  await migrate ()
  
}
const started= start () 

const app= express ( ) 
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

//Ensure config is ready 
app.use (async (req, res, next)=> {
  try {
    await started 
    next ()
  }
  catch (err) {
    next (err)
  }
})


//https://expressjs.com/en/resources/middleware/cookie-parser/
const authHandler : RequestHandler =   async (req, res, next )=> {
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


module.exports= app 







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
