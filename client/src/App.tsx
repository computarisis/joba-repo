

import { useState, type MouseEventHandler , useEffect} from 'react'
import {createPortal} from 'react-dom'
import {Routes, Router, useNavigate, useLocation} from 'react-router-dom'

import {QueryClient, QueryClientProvider, useMutation} from '@tanstack/react-query'; 
import { ReactQueryDevtools }  from '@tanstack/react-query-devtools';

import {AppResourceLogin} from './query.tsx'
import {useController} from '@data-client/react'
import {ButtonComponent , SignLogComponent} from './components.tsx'
import {schemaLogIn , schemaRegVal, schemaResetPassword, schemaReg} from './schema.ts'


const queryClient= new QueryClient ()  

import hero from './assets/hero.jpg'
import hero2 from './assets/hero2.jpg'
import hero3 from './assets/hero3.jpg'
import './App.css'


import  OptTab from './Internal.js'
import { Route } from 'react-router-dom';
//X: Need to fix form getting submitted 

type AppResp= {
  applications: {
    id: string
  }[], 
  nextCursor: string| null 
}

type panelImages = {
  src: [number, string, string]
}

const panelImages: panelImages[] = [
  { "src": [0, 'hero', hero] },
  { "src": [1, 'hero2', hero2] },
  { "src": [2, 'hero3', hero3] }
]



function ForgotPasswordModal () {
  const navigate= useNavigate ()
  const {isPending, data, mutate, isSuccess}= useMutation (
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
          isSuccess= {true}
          //textOpt="Forgot password?"
          text1Placeholder="Email"
          text2Placeholder="Password"
          buttonText="Get email"
          type1= "email"
          name1="email"
          successMessage='Recovery mail will be sent if an account with such email exists'
        />,
        document.body
      )
  )
}

function LogModal() 

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
          type2="Password"
          name1="Email"
          name2="Password"
        />,
        document.body
      )
  )
    
}




function RegModal() {

  
  const navigate= useNavigate ()
  const [inputError, setInputError]  = useState (false)
  
  function handleExit () {
   navigate ('/')
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    setInputError (false)
    const formData = new FormData (event.currentTarget)


    //Reject if any fields are undefined 
    if (formData.get ("Name")== undefined || formData.get ("Email") == undefined || formData.get ("Password") == undefined ) {
      setInputError (true )
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
      setInputError (true)
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


    if (res.status == 201) {
      navigate ('/board'
     
      , {
        state: {
          curCursor: null,
        }
      })
    }

  }


  return (
    createPortal (
      <div className='fixed flex inset-0 items-center justify-center z-200  bg-black/50'>
     
      <div className='absolute flex  items-center justify-center text-black  '>
        <form className="relative flex flex-col items-center justify-center  bg-white gap-1.5 p-20 rounded-xl" onSubmit={handleRegister}>
          <button  type="button" className= "absolute  right-2 top-1 font-bold text-lg" onClick={ ()=> {handleExit()}}> X </button> 

          <input  className= "bg-white rounded-md text-center h-[30px] w-[300px] " type="email" id="Email" name="Email" placeholder='Enter your email'></input>


          <input className= "bg-white rounded-md text-center h-[30px] w-[300px]" type="text" id="Name" name= "Name" placeholder='Name' ></input>
          <input className= "bg-white rounded-md text-center h-[30px] w-[300px]" type="password" id="Password" name= "Password" placeholder='Password'></input>
         
          <button className='bg-orange-600  text-white font-bold w-full flex justify-center items-center rounded-md' > Sign up </button>

          {inputError && <div> Invalid values; ensure password is between 8 and 32 characters </div> }
        </form>
      
        
      </div>
    </div>, 
      document.body
    )
  )
}


function ImagePanel() {
  const [curImg, setCurImg] = useState(0)

  function onNextImg() {
    let newImg = (curImg + 1) % 3
    setCurImg(newImg)
  }

  return (
    <div className= "max-w-6xl m-auto grid grid-cols-[1fr_1fr] mt-10 px-10 py-15"> 
      <div className="flex flex-col"> 
        <h3 className= "flex px-4 py-2 text-red-600 text uppercase font-bold "> Your job search organized</h3> 
        <h2 className= "flex px-4 py-4 font-extrabold text-6xl "> Keep applications and interviews  moving forward </h2> 
        <h3 className= "flex px-4 py-2 text-gray-600 text-lg text-extrabold  "> Track recruiter contacts, follow-ups, offers, applications, and interviews in a single place</h3>
      
        <div className=" px-4 py-2 grid grid-cols-[2fr_6fr] gap-2"> 
          <button className="flex px-1 py-2 bg-orange-500 text-white text-xs items-center justify-center ">Start tracking</button> 
          <div className= "flex flex-row align-start "> 
            <button> See how it works &rarr;</button> 
          </div>
         
        </div>
      </div>
    </div> 
    
   /* */
   /* <section className="relative h-[420px] w-full md:h-[720px] max-w-[1100px] mx-auto ">
    {panelImages.map((item) => {
      let opt = (item.src[0] == curImg) ? "opacity-100" : "opacity-0"
      let classStr = "absolute h-full w-full inset-0 object-cover " + opt + " transition-opacity duration-700 delay-300"

      return (
        <div key={item.src[1]} className={classStr}>
          <img src={item.src[2]} className={classStr}></img>
        </div>
      )
    })}

    <button className="absolute bg-black text-white bottom-5 right-5 px-5 py-5" onClick={() => { onNextImg() }}> &gt;</button>
  </section>  */
  )
}

function Benefits() {
  return (
    <> 
      <h2 id="Benefits"></h2>

      <section className=" bg-blue-100  py-7 px-7 ">


        <div className="flex flex-col items-center justify-center gap-8 rounded p-8 text-black  m-auto max-w-6xl">

          <div className= "grid grid-rows-[1fr_2fr] grid-cols-none  md:grid-rows-none md:grid-cols-[1fr_2fr] gap-5 "> 
            <div className= "flex flex-col"> 

              <span className="text-sm text-red-600  font-bold ">Less chaos</span> 
              <h2 className= "text-4xl font-extrabold"> 
                Spend less time managing the search and more time moving it forwad
              </h2>
            </div> 

            <div className= "flex flex-col gap-8"> 
              <div className="max-w-xl ">
                <h3 className="mb-2 text-xl font-bold">
                  Never Lose Track of an Application
                </h3>
                <p>
                  Keep every job opportunity, interview date, and recruiter contact in one central dashboard. Eliminate messy spreadsheets and scattered emails so you always know exactly where you stand.
                </p>
              </div>

              <div className="max-w-xl">
                <h3 className="mb-2 text-xl font-bold">
                  Stay Prepared for Every Interview
                </h3>
                <p>
                  Log interview feedback, salary ranges, and custom notes instantly. Having job details organized at your fingertips helps you prep faster, follow up on time, and make stronger impressions.
                </p>
              </div>

              <div className="max-w-xl">
                <h3 className="mb-2 text-xl font-bold">
                  Make Smarter Career Moves
                </h3>
                <p>
                  Get clear insights into your search momentum, response rates, and offer stages. Visualizing your progress helps you refine your strategy and land the right offer with confidence.
                </p>
              </div>
            </div> 

          </div> 

          
        </div>


      </section>
    </>
  );
}

function Testimony() {
  return (
    <>
      <h2 id="Testimonials"></h2>

      <section className="">
        <div className="flex flex-row items-start justify-center gap-10 rounded bg-blue-200 p-10 text-black">
          <div className="max-w-xs">
            <h3 className="mb-1 text-xl font-bold">
              Sarah Jenkins
            </h3>
            <span className="mb-3 block text-sm font-medium text-gray-600">
              Software Engineer
            </span>

            <p>
              &quot;I was applying to dozens of roles and losing track of follow-ups. This app completely saved my job search—I landed three offers because I never missed an interview prep or deadline.&quot;
            </p>
          </div>

          <div className="max-w-xs">
            <h3 className="mb-1 text-xl font-bold">
              Marcus Chen
            </h3>
            <span className="mb-3 block text-sm font-medium text-gray-600">
              Product Designer
            </span>

            <p>
              &quot;Ditching my messy Notion setup for this was the best decision. Having salary notes, interviewer details, and application status in one place kept me totally stress-free.&quot;
            </p>
          </div>

          <div className="max-w-xs">
            <h3 className="mb-1 text-xl font-bold">
              Elena Rostova
            </h3>
            <span className="mb-3 block text-sm font-medium text-gray-600">
              Marketing Manager
            </span>

            <p>
              &quot;The response rate insights helped me realize which resume versions actually worked. It turned what is usually a chaotic process into an organized, strategic routine.&quot;
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Features() {
  return (
    <>
      <h2 id="Features"></h2>

      <section className=" bg-blue-200 px-5 py-6 ">

        <div className= "grid grid-row [1fr_1fr] m-auto max-w-6xl gap-4 px-10 py-10"> 

          <div className= "grid grid-cols-[1fr_1fr]"> 
            <div className="flex flex-col gap-4 "> 
              <div className="text-sm text-red-600  font-bold ">Everything in one place</div> 
              <div className="font-extrabold text-4xl ">Built around the way a real job search works </div> 

              <div className="text-bold text-gray-500">Instead of scatterred notes, eails, and spreadsheets, Joba gives each opportunity 
              a clear place to live  </div> 
            </div> 
          </div> 
         

          <div className="flex flex-col md:flex-row  items-start justify-center gap-10 rounded  py-10 text-black m-auto max-w-6xl">
            <div className="bg-white text-blac px-8 py-8 flex- flex-col rounded-lg "> 
                <div className="rounded-full px-4 py-4 w-1 h-1 bg-red-200 font-bold text-red-500 flex justify-center items-center " > 1 </div> 
                <h3 className="mb-3 text-xl font-extrabold py-5 ">
                  Application tracking 
                </h3>
                <p>
                Keep every job opportunity and its current stage in one place, from saved and applied to interview, offer, or rejection.
                </p>
            </div> 
    
            <div className="bg-white text-blac px-8 py-8 flex- flex-col rounded-lg "> 
                <div className="rounded-full px-4 py-4 w-1 h-1 bg-red-200 font-bold text-red-500 flex justify-center items-center " > 2 </div> 
                <h3 className="mb-3 text-xl font-extrabold py-5 ">
                  Interview planning
                </h3>
                <p>
                  Store interview dates, recruiter contacts, notes, salary details, and follow-up information where you can find them quickly. 
                </p>
            </div> 



            <div className="bg-white text-blac px-8 py-8 flex- flex-col rounded-lg "> 
                <div className="rounded-full px-4 py-4 w-1 h-1 bg-red-200 font-bold text-red-500 flex justify-center items-center " > 3 </div> 
                <h3 className="mb-3 text-xl font-extrabold py-5 ">
                  Job-search insights 
                </h3>
                <p>
                    See how your search is progressing so you can understand response rates, identify patterns, and make better decisions. 
                </p>
            </div> 


          </div>

        </div> 


       
      </section>



    </>
  );
}

//log , sign in here 
function HeroNav() {
  const navigate= useNavigate ()
 
  const handleSignUp = () => {
    console.log("Modal entered")
    navigate ('/register', 
      { replace: true }
    )
  }
  
  const handleLogIn =() =>{
    console.log ("Login entered")
    navigate ('/login', 
      { replace: true }
    )
  }

  return (
    <section className="bg-blue-100 px-10 py-3 " >
      <div className="sticky flex flex-row m-auto max-w-6xl op-0 h-[50px]  items-center justify-between px-5 py-5 ">
      
      
        <div className="text-2xl font-bold ">
          Joba
        </div>


          <nav>
            <ol className='flex flex-row gap-3.5 font-semibold '>
              <li>
                <a href="#Features"> Features</a>
              </li>

              <li>
                <a href="#Benefits"> Benefits </a>
              </li>

              <li>
                <a href="#Testimony">Testimony</a>
              </li>
            </ol>
          </nav>
    


          <ol className="flex flex-row gap-2">
              <li>
                <button  className="bg-white font-semibold text-xs text-gray-700 rounded border border-gray-400 hover:bg-gray-100 px-3 py-1.5"  onClick={() => { handleLogIn() }}> Sign in </button>
              </li>
              <li> 
                <button  className="bg-orange-500 font-semibold text-xs text-white rounded border border-orange-600 hover:bg-orange-600 px-3 py-1.5" onClick= { ()=> { handleSignUp () }}> Sign up </button>
              </li> 
            </ol>
      </div>


      
      <ImagePanel></ImagePanel>
     </section>

    
  )
}

function Footer() {
  return (

      <footer className="text-white bg-black h-[50px] px-20 py-20">
        <ol className= "flex px-10 py-10 ">
          <li>
            All rights reserved
          </li>
          <li>
            (787)- 238-2349
          </li>
          <li>
            Utuado, Puerto Rico
          </li>
        </ol>
      </footer>

  )
}


function ValidateEmailTab () {

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
    , queryClient

  )

  useEffect (
    ()=> {
      mutate ()
    }, []
  )

  return (
    <> 
       <h1 className="text-6xl font-extrabold"> Registrate page... Confirming email...</h1>
       {isPending && <div className="text-6xl font-extrabold">Loading...</div>}
       {isError && <div className="text-6xl font-extrabold">Invalid token...</div>}
       {isSuccess && <div >Confirmed. Proceed to the main page</div>}
    </> 
  )
}


function ChangePassTab () {

  type resetType= {
    token: string , 
    newPassword: string
  }
  //Extract the token from the url 
  const resetToken= new URLSearchParams (window.location.hash.substring(1)). get ('token') as string
  const navigate= useNavigate ()
  
  //Combined use for server call and local check 
  const [isError, setIsError] = useState (false)


  
  

  const {isPending, mutate , isSuccess} = useMutation (
    {
      mutationFn: async (resetObj: resetType)=> {

      
        const parsedObj= schemaResetPassword.safeParse (resetObj) 
        if (!parsedObj.success) {
          setIsError (true)
          throw new Error ()
          
        }

        const res=  await fetch ('/api/auth/reset-password', 
         {
            method: "POST", 
            headers: {
              "Content-type": "Application/json"
            }, 
            body: JSON.stringify (resetObj)
         }
        )

        console.log ('status:', res.status)
        if (res.status!= 200) {
          
          setIsError (true)
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

   
    if ( pass1!= pass2 || typeof pass1 !== "string") {
      setIsError (true)
      return 
    }
    else   {
      const resetObj= {
        token: resetToken , 
        newPassword: pass1
      }
      mutate (resetObj)
    }
  }

  return (
    createPortal(
      <SignLogComponent
        handleSubmit={handleSubmit}
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
      />,
      document.body
    )
  )

}

function App () {
  const location= useLocation ()
  //Determine if url corresponds to one of the login/signup/password modals 

  const isModal= ["/validate-email", "/change-password", "/login", "/forgot-password", "/register"].includes (location.pathname)
  const bgLocation= isModal? "/": location

  return (
    <> 
    <Routes location= {bgLocation}> 
      <Route path= "/" element= {<Home></Home> }></Route>
      <Route path= "/board" element= {<OptTab></OptTab>}></Route> 
    </Routes> 

    {
      isModal&& 
        (
          <Routes location = {location}> 
          <Route path= "/validate-email" element= {<ValidateEmailTab></ValidateEmailTab>}></Route> 
          <Route path= "/change-password" element= {<ChangePassTab></ChangePassTab>}></Route> 
          <Route path= "/login" element= {<LogModal></LogModal>}></Route> 
          <Route path= "/register" element= {<RegModal></RegModal>}></Route> 
          <Route path= "/forgot-password" element= {<ForgotPasswordModal></ForgotPasswordModal>}></Route> 
        </Routes>
        )
    }
   
    </>
    
  )
}

function Home() {
  return (
    <>
      <HeroNav></HeroNav>
      <Features></Features>
      <Benefits></Benefits>
      <Testimony></Testimony>
      <Footer></Footer>
    </>
  )
}

export default App




/* 

<section className="relative h-[420px] w-full md:h-[720px] max-w-[1100px] mx-auto ">
    {panelImages.map((item) => {
      let opt = (item.src[0] == curImg) ? "opacity-100" : "opacity-0"
      let classStr = "absolute h-full w-full inset-0 object-cover " + opt + " transition-opacity duration-700 delay-300"

      return (
        <div key={item.src[1]} className={classStr}>
          <img src={item.src[2]} className={classStr}></img>
        </div>
      )
    })}

    <button className="absolute bg-black text-white bottom-5 right-5 px-5 py-5" onClick={() => { onNextImg() }}> &gt;</button>
  </section>  */