

import { z } from "zod";


export const schemaRegVal =  z.object ( {
    name: z.string().trim().min(1).max(100).nullish() ,
    email: z.email (), 
    password: z.string().min(8).max(32)
  }) 
export const schemaReg=  z.object ( {
  token: z.string ()
}) 
  
export const schemaLogIn = z.object (
   {
    email: z.email (), 
    password:  z.string().min(8).max(32)
   }
  ) 
  
export const schemaPostApplication= z.object (
    {
      company: z.string ().trim ().min (1).max (100), 
      role:  z.string ().trim ().min (1).max (100), 
      status:  z.enum ( ["saved", "applied", "interview", "offer", "rejected"]),
      applicationDate: z.iso.date().nullish(), 
      jobUrl: z.string ().trim ().min(1).max (100).nullish(), 
      salaryMin: z.float32().nullish(), 
      salaryMax: z.float32 ().nullish() , 
      notes: z.string().nullish()
  
    }
  )

  export const schemaPatchApplication = z.object (
    {
        company: z.string ().trim ().min (1).max (100).nullish(), 
        role:  z.string ().trim ().min (1).max (100).nullish(), 
        status:  z.enum ( ["saved", "applied", "interview", "offer", "rejected"]).nullish(),
        applicationDate: z.iso.date().nullish(), 
        jobUrl: z.string ().trim ().min(1).max (100).nullish(), 
        salaryMin: z.float32().nullish(), 
        salaryMax: z.float32 ().nullish() , 
        notes: z.string().nullish()
    }
  )

export const schemaCursor= z.object (
   {
    id: z.int(),
    createdAt: z.iso .datetime(), 
  
   }
  )
export const schemaAuthToken= z.object (
    {
      userId: z.string () , 
      espire: z.string (), 
    }
  )

export const schemaforgotPassword = z.object (
  {
    email: z.email ()
  }
) 
export const schemaResetVerify = z.object (
  {
    token: z.string ()
  }
) 

export const schemaResetPassword = z.object (
  {
   token: z.string (),
   newPassword:  z.string().min(8).max(32)
  }
 ) 
 

