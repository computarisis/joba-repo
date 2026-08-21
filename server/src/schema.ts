
import { application } from "express";
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
  
  
//Note: Contract requires client to provide a status 
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
 
  
export type applicationRow = {
    id: number
    company: string
    role: string
    status: string
    applicationDate: string | null
    jobUrl: string | null
    salaryMin: number | null
    salaryMax: number | null
    notes: string | null
    createdAt: string
    updatedAt: string
}
    
export type schemaPostApplicationType= z.infer <typeof schemaPostApplication> 
export type schemaPatchApplicationType= z.infer <typeof schemaPatchApplication> 
export type schemaCursorType = z.infer <typeof schemaCursor> 

export type cursorObj= {
    id: number , 
    createdAt: string
}
export type applicationQuery ={
    applications: applicationRow [],  
    nextCursor: string | null
}