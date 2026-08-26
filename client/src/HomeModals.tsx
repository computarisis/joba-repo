

import { useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import {useNavigate} from 'react-router-dom'
import {useMutation} from '@tanstack/react-query'; 
import {AppResourceLogin} from './query.tsx'
import {useController} from '@data-client/react'
import {SignLogComponent} from './Components.tsx'
import {schemaLogIn , schemaRegVal, schemaResetPassword, schemaReg} from './schema.ts'

import './App.css'



export function ForgotPasswordModal () {
    const navigate= useNavigate ()
    const {isPending, mutate, isSuccess}= useMutation (
      {
        mutationFn: async (emailParam: string)=> {
          const res= await fetch ('/api/auth/forgot-password',  {
            method: "POST", 
            headers: {
              "Content-type": "Application/json"
            },
            body: JSON.stringify ({
              email: emailParam
            })
          })
          console.log (res)
        }
       
      }
    )
  
    async function handleForgotPass (event: React.FormEvent<HTMLFormElement> ) {
      event.preventDefault () 
      const formData= new FormData (event.currentTarget)
  
      //Note: Validate input is a correct email (HTML does this)
      const emailInput= formData.get ("email") as string
      mutate (emailInput)
    }
    const handleExit = ()=> {
      navigate ('/')
    }
  
    return ( 
        createPortal(
          <SignLogComponent
            handleSubmit={handleForgotPass}
            handleExit={handleExit}
            isSuccess= {isSuccess}
            isLoading= {isPending}
            text1Placeholder="Email"
            text2Placeholder="Password"
            buttonText="Get email"
            type1= "email"
            name1="email"
            successMessage='If email is registered, you will receive a recovery message '
            redirectToLogIn= {true}
          />,
          document.body
        )
    )
  }
  
export function LogModal() 
  
  {
    const navigate= useNavigate ()
    const controller= useController ()
    const [isLoading, setIsLoading]= useState (false) 
    const [isError, setIsError]= useState (false) 
    const handleExit = ()=> {
      navigate ('/')
    }
  
    //Note: We should not invalidate password when user tries to log in
    const handleLogIn= async (event: React.FormEvent<HTMLFormElement>) =>{
      event.preventDefault ()
      const formData= new FormData (event.currentTarget)
      
     
      let parsedLogin: any
      const loginParma= {
        email: formData.get ("Email"), 
        password: formData.get ("Password")
      }
  
  
      parsedLogin= schemaLogIn.safeParse (loginParma)
      if (parsedLogin.success) {}
      else {
        console.log (parsedLogin.error)
        setIsError(true) 
        return 
      }
  
  
      async function  sendLogin () {
        try {
          setIsLoading (true) 
          await controller.fetch (AppResourceLogin, parsedLogin.data)
          console.log (parsedLogin.data)
          //No need to check error code? SEE
          navigate ('/board')
  
        }
        catch (error){
          setIsError(true) 
        }
        finally {
          setIsLoading (false) 
        }
       
      }
      //Call 
      await sendLogin ()
     
    }
  
    {/*Logging */}
    return ( 
        createPortal(
          <SignLogComponent
            handleSubmit={handleLogIn}
            handleExit={handleExit}
            handleForgotPass= { ()=> {navigate ('/forgot-password')}}
            isLoading={isLoading}
            isError={isError}
            isSuccess= {undefined}
            textOpt="Forgot password?"
            text1Placeholder="Email"
            text2Placeholder="Password"
            buttonText="Log in"
            textError="Invalid email or password"
            type1= "Email"
            type2="password"
            name1="Email"
            name2="Password"
          />,
          document.body
        )
    )
      
  }
export function ValidateEmailTab () {
  
    const navigate= useNavigate ()
    //Extract from url fragment  https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    const tokenVal= new URLSearchParams (window.location.hash.substring (1)).get ('token')
    type resType ={
      ok: boolean
    }
  
    const {mutate, isPending, isSuccess, isError} = useMutation (
      {
        mutationFn:  async ()=> {
  
          let parsedToken
          parsedToken= schemaReg.safeParse (
            {
              token: tokenVal
            }
          )
          if (parsedToken.success) {}
          else {
            console.log (parsedToken.error)
            throw new Error ()
          }
           
           const res= await fetch ('/api/auth/register', {
            method: "POST", 
            headers: {
              "Content-type":"Application/json"
            }, 
            body: JSON.stringify (parsedToken.data)
          }) 
  
          const resJson=  await res.json () as resType
  
          console.log ( '-----', res.status )
          if (res.status==201) {
            console.log ('valid OK')
          }
          else {
            throw new Error ()
          }
  
          return resJson
        }, 
        onSuccess: (data)=> {
  
          if (data.ok){
            console.log ('OK')
          }
        }
        
      }
  
    )
  
    useEffect (
      ()=> {
        mutate ()
      }, []
    )
  
    const handleExit = ()=> {
      navigate ('/')
    }
  
    return createPortal(
      <SignLogComponent
        handleExit={handleExit}
        isLoading={isPending}
        isSuccess={isSuccess}
        isError={isError}
        textError="Invalid or consumed token"
        successMessage="Registration successful"
        redirectToLogIn= {true}
        
      />,
      document.body
    )
  }
  
  
export function ChangePassTab () {
  
    type resetType= {
      token: string , 
      newPassword: string
    }
    type resetArg = {
      reset: resetType, 
      pass2: string
    }
    //Extract the token from the url 
    const resetToken= new URLSearchParams (window.location.hash.substring(1)). get ('token') as string
    const navigate= useNavigate ()
    
  
  
  
    
    
  
    const {isPending, mutate , isSuccess, isError} = useMutation (
      {
        mutationFn: async (resetObj: resetArg )=> {
  
          if ( resetObj.reset.newPassword!= resetObj.pass2 || typeof resetObj.reset.newPassword !== "string") {
            throw new Error ()
          }
  
          const parsedObj= schemaResetPassword.safeParse (resetObj.reset) 
          if (!parsedObj.success) {
            throw new Error ()
            
          }
  
          const res=  await fetch ('/api/auth/reset-password', 
           {
              method: "POST", 
              headers: {
                "Content-type": "Application/json"
              }, 
              body: JSON.stringify (resetObj.reset)
           }
          )
  
          console.log ('status:', res.status)
          if (res.status!= 200) {
            throw new Error ()
          }
          
        },
        onSuccess: ()=> {
          navigate ('/login')
        }
      }
    )
  
    const handleSubmit=   (event: React.FormEvent<HTMLFormElement>)=> {
      event.preventDefault ()
      const formData= new FormData (event.currentTarget)
      const pass1= formData.get ('password1') as string
      const pass2= formData.get ('password2') as string 
  
     
  
      const resetObj= {
        reset: {
          token: resetToken , 
          newPassword: pass1
        }, 
        pass2: pass2 
      }
      mutate (resetObj)
      
    }
  
    const handleExit = ()=> {
      navigate ('/')
    }
  
    
  
    return (
      createPortal(
        <SignLogComponent
          handleSubmit={handleSubmit}
          handleExit= {handleExit}
          isLoading={isPending}
          isError={isError}
          isSuccess = {isSuccess}
          text1Placeholder="New Password"
          text2Placeholder="Confirm New Password"
          buttonText="Change password"
          textError="Ensure passwords match; length should be between 8 and 32 characters."
          type1= "password"
          type2="password"
          name1="password1"
          name2="password2"
          successMessage="Password changed successfully"
          redirectToLogIn= {true}
        />,
        document.body
      )
    )
  
  }
  
  
  
export function RegModal() {
  
    
    const navigate= useNavigate ()
    function handleExit () {
     navigate ('/')
    }
  
    const {isSuccess, mutate, isPending, isError} = useMutation ( 
      {
        mutationFn: async (formData: FormData) => {
          //Reject if any fields are undefined 
         if (formData.get ("Name")== undefined || formData.get ("Email") == undefined || formData.get ("Password") == undefined ) {
           return 
         }
         const formArg = schemaRegVal.safeParse({
           name: formData.get("Name") as string,
           email: formData.get("Email") as string,
           password: formData.get("Password") as string,
         })
   
         if (formArg.success) {}
         else {
           console.log (formArg.error)
           throw new Error ()
           return 
  
         }
       
         //Fields are guaranteed to be defined
         let res = await fetch("/api/auth/register-validate", {
           method: "POST",
           headers: {
             "Content-type": "Application/json"
           },
           credentials:"include", 
           body: JSON.stringify(formArg.data)
         })
   
         if (res.status != 200) {
           throw new Error ()
         }
       }
      }
    )
    async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()
      
      const formData = new FormData (event.currentTarget)
  
      mutate (formData)
    }
  
  
    return createPortal(
      <SignLogComponent
        handleSubmit={handleRegister}
        handleExit={handleExit}
    
        isError={isError}
    
        text1Placeholder="Enter your email"
        type1="email"
        name1="Email"
    
        text2Placeholder="Name"
        type2="text"
        name2="Name"
    
        text3Placeholder="Password"
        type3="password"
        name3="Password"
    
        buttonText="Sign up"
        textError="Email may belong to existing account; ensure password is between 8 and 32 characters. ."
        isSuccess={isSuccess}
        successMessage="Validate your email"
        isLoading={isPending}
      />,
      document.body
    )
  }
  