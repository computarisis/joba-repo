import { envConfig } from "./config"
import { Pool, type QueryResultRow } from "pg";

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
export async function migrate  () {
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
  