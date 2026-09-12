import {Schema, Repository, Entity} from 'redis-om'



export interface RecoveryRecord extends Entity {
    userId: number, 
    tokenHash: string
}

export interface InvalidateRecord extends Entity {
    jwtCipher: string
}

export interface RegValRecord extends Entity {
    name: string | undefined |null ,
    email: string, 
    passwordHash: string, 
    tokenHash: string
}

//Note: Both fields are indexed for fast lookup (by default) 
export const recoverySchema= new Schema<RecoveryRecord> (
    'recSchema', 
    {
        'userId':    {type: 'string'}, 
        'tokenHash': {type: 'string'}
    }, 
    {
        dataStructure: 'JSON'
    }
)
export const invalidateSchema= new Schema<InvalidateRecord> (
    'invalidateSchema', 
    {
        'jwtCipher': {type: 'string'}
    }, 
    {
        dataStructure: 'JSON'
    }
)


export const regValSchema= new Schema<RegValRecord> (

    'regValSchema',
    {
        email: {type: 'string'}, 
        name: {type: 'string'}, 
        passwordHash: {type: 'string'}, 
        tokenHash: {type: 'string'}
        
    },
    {
        dataStructure: 'JSON'
    }

)



import { envConfig } from './config' 
import {createClient} from 'redis'
//Create redis client 
export const redisClient= createClient (
    {
        url: envConfig.redisUrl
    }
  )
  

export const recoveryCache= new Repository (recoverySchema, redisClient)
export const regCache= new Repository (regValSchema, redisClient)
export const invalidateCache= new Repository (invalidateSchema, redisClient)



//As a workaround for Vercel deployment, we override the dropIndex method so that it can ignore the SEARCH_INDEX_NOT_FOUND error
//which comes in a format no recognized by the redis version offered by vercel 

//https://redis.io/docs/latest/develop/clients/nodejs/queryjson/
//Before an index is created, redis tries to see if it already exists, and proceeds to delete it -that's when the problematic error is being thrown
//We try to emulate that ; we need to both unlink (remove client metadata associated to index) and then drop the index itself

export async function modifyIndices (
    cache: Repository, 
    index: any 
  ) {
  
    cache.dropIndex=  async () => {
      
      await redisClient.unlink  (index.indexHashName);
      try {
        await  redisClient.sendCommand (["FT.DROPINDEX", index.indexName])
      } 
      catch (error: any) {
        const message= String (error?. message)  
        const remove= message.includes ("SEARCH_INDEX_NOT_FOUND")  || message.includes ("Unknown index name") || message.includes ("Unknown Index name"); 
        if ( !remove) {
          throw error ; 
        }
      }
  
    }
  }
  