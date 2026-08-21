import {Schema, Repository, Entity} from 'redis-om'



export interface RecoveryRecord extends Entity {
    userId: number, 
    tokenHash: string
}

export interface InvalidateRecord extends Entity {
    jwtCipher: string
}

export interface RegValRecord extends Entity {
    name: string | undefined ,
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

