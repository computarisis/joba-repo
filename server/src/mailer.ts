import { envConfig } from "./config"
import nodemailer from "nodemailer";

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