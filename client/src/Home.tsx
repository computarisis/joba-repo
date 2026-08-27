


import {Routes, useNavigate, useLocation, Navigate} from 'react-router-dom'
import { useMutation} from '@tanstack/react-query'; 
import {useEffect} from 'react'
import hero2 from './assets/heroImg.jpg'
import './App.css'
import  OptTab from './Internal.js'
import { Route } from 'react-router-dom';
import {ForgotPasswordModal, LogModal, ValidateEmailTab, ChangePassTab, RegModal} from './HomeModals.js'


type panelImages = {
  src: [number, string, string]
}

const panelImagesObj: panelImages[] = [
  { "src": [0, 'heroImg', hero2] },

]


function ImagePanel() {
 
  const navigate= useNavigate ()

  return (
    <div className= "max-w-6xl m-auto grid grid-cols-[1fr_1fr] mt-10 px-10 py-15"> 
      <div className="flex flex-col"> 
        <h3 className= "flex px-4 py-2 text-red-600 text uppercase font-bold "> Your job search organized</h3> 
        <h2 className= "flex px-4 py-4 font-extrabold text-4xl md:text-6xl "> Keep applications and interviews  moving forward </h2> 
        <h3 className= "flex px-4 py-2 text-gray-600 text-lg text-extrabold  "> Track recruiter contacts, follow-ups, offers, applications, and interviews in a single place</h3>
      
        <div className=" px-4 py-2 grid grid-cols-[2fr_6fr] gap-2"> 
          <button className="flex px-1 py-2 bg-orange-500 text-white text-xs items-center justify-center hover:bg-orange-600" onClick= {()=> { navigate ('register') } }>Start tracking</button> 
          <div className= "flex flex-row align-start hover:bg-blue-200"> 
            <button onClick= { ()=> {navigate ('register') }}> See how it works &rarr;</button> 
          </div>
         
        </div>
      </div>

      <div className= "flex flex-row justify-center items-center hidden md:flex ">
        <div  key={panelImagesObj[0].src[1]} >
          <img className= "rounded-lg" src={panelImagesObj[0].src[2]}></img>
        </div>
      </div>
    </div> 
    
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
      <h2 id="Testimony"></h2>

      <section className=" bg-blue-200">
        <div className="grid grid-rows-[1fr] md:grid-rows-none md:grid-cols-[1fr_1fr_1fr] gap-10 rounded  p-10 text-black m-auto max-w-6xl">
         
         
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

        <div className= "grid grid-row [1fr_1fr] m-auto max-w-6xl gap-4 px-10 py-10 "> 
         
          <div className= "flex justify-center items-center hover:bg-blue-100">
            <div className= "grid grid-cols-[1fr]"> 
              <div className="flex flex-col gap-4 "> 
                <div className="text-sm text-red-600  font-bold ">Everything in one place</div> 
                <div className="font-extrabold text-4xl ">Built around the way a real job search works </div> 

                <div className="text-bold text-gray-500">Instead of scatterred notes, eails, and spreadsheets, Joba gives each opportunity 
                a clear place to live  </div> 
              </div> 
            </div> 
          </div>

          <div className="flex flex-col md:flex-row  items-start justify-center gap-10 rounded  py-10 text-black m-auto max-w-6xl ">
            <div className="bg-white text-blac px-8 py-8 flex- flex-col rounded-lg  hover:bg-blue-100"> 
                <div className="rounded-full px-4 py-4 w-1 h-1 bg-red-200 font-bold text-red-500 flex justify-center items-center " > 1 </div> 
                <h3 className="mb-3 text-xl font-extrabold py-5 ">
                  Application tracking 
                </h3>
                <p>
                Keep every job opportunity and its current stage in one place, from saved and applied to interview, offer, or rejection.
                </p>
            </div> 
    


            <div className="bg-white text-blac px-8 py-8 flex- flex-col rounded-lg  hover:bg-blue-100"> 
                <div className="rounded-full px-4 py-4 w-1 h-1 bg-red-200 font-bold text-red-500 flex justify-center items-center " > 2 </div> 
                <h3 className="mb-3 text-xl font-extrabold py-5 ">
                  Interview planning
                </h3>
                <p>
                  Store interview dates, recruiter contacts, notes, salary details, and follow-up information where you can find them quickly. 
                </p>
            </div> 



            <div className="bg-white text-blac px-8 py-8 flex- flex-col rounded-lg hover:bg-blue-100 "> 
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
      
        <div className= "flex flex-col  ">
          <div className="text-2xl font-bold flex flex-row justify-center items-center">
            <div> 
              Joba
            </div>
          </div>

        </div>
        
          
        <nav className="hidden md:block">
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
       <div className= "m-auto flex items-center justify-center"> 
          <div className= "flex items-center justify-center "> 
            <ul>
              <li >Utuado, Puerto Rico</li>
              <li className= "hover:bg-gray-600"> 
                <a href ="https://github.com/computarisis/joba-repo" target="_blank" rel="noopener noreferrer"> Contact us in Github</a>
              </li>
            </ul>
          </div>
       </div>
      </footer>

  )
}


function ProtectedBoardRoute ( {children}: {children: React.ReactNode}) {


  const {mutate, isPending, isSuccess, isError} = useMutation (
    {
      mutationFn: async () => {
        const res= await fetch ('/api/auth/me',
          {
            credentials: "include"
          }

        )
        if (res.status!=200 ) {
          throw new Error ()
        }
      }

    }
  )

  useEffect ( ()=> {
    mutate ()
  }, [])
 
  return (
    <> 
      {isPending && <div> Loading... </div>}
      {isError && <Navigate to="/" replace />}

      {isSuccess && children }
    
    </>
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
      <Route path= "/board" element= { <ProtectedBoardRoute><OptTab></OptTab></ProtectedBoardRoute>}></Route> 
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


