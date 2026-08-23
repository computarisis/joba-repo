


import {Entity, resource, RestEndpoint} from '@data-client/rest'
const API_URL = "http://localhost:3001"

export let updatedCursor : string|null  = null 
export type applicationType= 
{
  id: number ,
  company: string |null,
  role: string |null,
  status: string |null,
  applicationDate :string |null,
  jobUrl: string |null,
  salaryMin: number |null,
  salaryMax: number |null,
  notes: string |null,
  createdAt: string |null ,
  updatedAt: string |null 
}

export  type appsType= {
  "applications": [
    applicationType
  ]
} 

export class Application extends Entity {
  id : number  =0 ; //SEE
  company: string | null = null ;
  role : string | null = null ;
  status: string | null = null ;
  applicationDate: string | null = null ;
  jobUrl  : string | null = null ;
  salaryMin: number | null = null ;
  salaryMax: number | null = null ;
  notes : string | null = null ;
  createdAt: string | null = null ;
  updatedAt : string | null = null ;

  static key= 'Application'

}



type readParam ={
  limit?: number
  cursor?: string
}

export const AppResource= resource ({
  urlPrefix: API_URL,
  path: '/api/applications/:id', 
  schema: Application, 
  optimistic: true, 
  paginationField: 'cursor'

})


type ReqResponse = { 
  applications:  applicationType  [] ,
  nextCursor: string | null 
}

type loginBody = {
  email: string 
  password: string 
}




export const AppResourceCreate= AppResource.create.extend(
 {
  path: '/api/applications', 

  async getRequestInit (body: appsType) : Promise<RequestInit> {
    return {
      ... (await AppResource.create.getRequestInit (body)), 
      credentials: "include"
    }
  }, 

  process  (values: any): applicationType{
    return values.application as applicationType
  }

 }
)
//TODO: we could consider extending the schema to store user data payload sent in the login
export const AppResourceLogin = AppResource.create.extend (
  {
    path: '/api/auth/login', 
    schema: {
      applications: [Application], 
      nextCursor: ""
    },

    async getRequestInit (body: loginBody) : Promise<RequestInit> {
      return {
        ... (await AppResource.create.getRequestInit (body)), 
        credentials: "include"
      }
    }, 
    process (values: ReqResponse) : ReqResponse {
      updatedCursor= values.nextCursor as string
      return {
        applications: values.applications , 
        nextCursor: values.nextCursor
      }
    }

  }
)

export const AppResourceReadPage= AppResource.getList.getPage.extend (
  {
    path: '/api/applications' ,  //SEE
    searchParams: {} as  readParam , 

    schema: {
      applications: [Application],
      nextCursor: '',
    },

    async getRequestInit (body: appsType) : Promise<RequestInit> {
      return {
        ... (await AppResource.getList.getRequestInit (body)), 
        credentials: "include"
      }
    }, 
    process  (values: any): ReqResponse{
      return {
        applications: values.applications , 
        nextCursor: values.nextCursor
      } as ReqResponse
    
    }
  }
)



export const AppResourceDelete= AppResource.delete.extend (
  {
    async getRequestInit (body: any) : Promise<RequestInit> {
      return {
        ... (await AppResource.delete.getRequestInit (body)), 
        credentials: "include"
      }
    }
  }
)
export const AppResourceUpdate= AppResource.partialUpdate.extend (
  {
    async getRequestInit (body: any) : Promise<RequestInit> {
      return {
        ... (await AppResource.partialUpdate.getRequestInit (body)), 
        credentials: "include"
      }
    }, 
    process (value: any): Partial<applicationType>  {
      return value.application as Partial <applicationType> // Cast, making fields optional
    }
  }
)








