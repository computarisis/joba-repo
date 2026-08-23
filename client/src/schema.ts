

import { z } from "zod";


export const schemaRegVal =  z.object ( {
    name: z.string().trim().min(1).max(100).optional() ,
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
      applicationDate: z.iso.date().optional(), 
      jobUrl: z.string ().trim ().min(1).max (100).optional(), 
      salaryMin: z.float32().optional(), 
      salaryMax: z.float32 ().optional() , 
      notes: z.string().optional()
  
    }
  )

  export const schemaPatchApplication = z.object (
    {
        company: z.string ().trim ().min (1).max (100).optional(), 
        role:  z.string ().trim ().min (1).max (100).optional(), 
        status:  z.enum ( ["saved", "applied", "interview", "offer", "rejected"]).optional(),
        applicationDate: z.iso.datetime().optional(), 
        jobUrl: z.string ().trim ().min(1).max (100).optional(), 
        salaryMin: z.float32().optional(), 
        salaryMax: z.float32 ().optional() , 
        notes: z.string().optional()
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
 

