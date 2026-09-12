
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
    frontendOrigin: (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.FRONTEND_ORIGIN
    ),
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