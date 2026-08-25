

import './App.css'
import {useCache, useController, useDLE, useQuery} from '@data-client/react'
import { All } from '@data-client/rest';

import {useState, type SetStateAction, useEffect, useRef} from 'react'
import { createPortal } from 'react-dom';
import {type applicationType, Application, AppResourceCreate, AppResourceDelete, AppResourceUpdate, updatedCursor, AppResource, AppResourceReadPage, AppResourcePush}  from './query.tsx'
import {useQueryClient, useMutation, QueryClient} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {EditAppComponent} from  './components.js'
import {schemaPostApplication, schemaPatchApplication} from './schema.ts'
import { DataListItemValue } from '@mantine/core';


const FETCH_SIZE= 10
const emptyApplication: applicationType = {
  company: null,
  role: null,
  status: 'applied',
  applicationDate: null,
  jobUrl: null,
  salaryMin: null,
  salaryMax: null,
  notes: null
}; 


function EditModal ( {itemEdit, setEditItem, createFlag, actionText}: 
  { itemEdit: applicationType | null,
    setEditItem: React.Dispatch<SetStateAction<applicationType|null>>, 
    createFlag: boolean , 
    actionText: string

  }
) 
{
  const [editVar, setEditVar]= useState (itemEdit)
  const[inputError, setInputError]= useState (false)
  const controller = useController ()

   
  const onUpdate= async (event:  React.FormEvent<HTMLFormElement>)=> {
    event.preventDefault ()
    //Validate input 
    //When createFlag is true it signals a create call ; when it is false, it signals an update call  
    const editVarArg = {
      company: editVar?.company,
      role: editVar?.role,
      status: editVar?.status,
      applicationDate: editVar?.applicationDate,
      jobUrl: editVar?.jobUrl,
      salaryMin: editVar?.salaryMin,
      salaryMax: editVar?.salaryMax,
      notes: editVar?.notes,
    }

    if (createFlag){
      const parsedObj= schemaPostApplication.safeParse (editVarArg)
      if (parsedObj.success) { setInputError (false)
       }
      else {
        setInputError (true)
        return 
      }
 
      await controller.fetch (AppResourcePush,  parsedObj.data)
    }
    else {
      const parsedObj= schemaPatchApplication.safeParse (editVarArg)
      //Can't edit 
      if (editVar?.id== null ) {
        console.log  ('Inconsistent object (id must be present)')  
        return 
      }
      
      if (parsedObj.success) { setInputError (false) }
      else {
        setInputError (true)
        return 
      }

      //console.log ('sending ... ', editVarArg)
      await controller.fetch (AppResourceUpdate, {id: editVar?.id}, editVarArg)
      //console.log ('onUpdate call through --- ',  editVar?.id)
    }
    setEditItem (null)
  }
  const STATUS_OPTS= ["applied", "interview", "offer", "saved", "rejected"]

  return (
    createPortal(
      <EditAppComponent
        onUpdate={onUpdate}
        editVar={editVar}
        setEditVar={setEditVar}
        STATUS_OPTS={STATUS_OPTS}
        setEditItem={setEditItem}
        actionText= {actionText}
        inputError= {inputError}
      />
      , 
      document.body
    )
  )
}


function DeleteBar ( {delFunc}: { delFunc: ()=> void }) 
{
  const [showConfirm, setShowConfirm]= useState (false)

  //On Yes, component is remounted 
  if (showConfirm) {
    return (
      <> 
        <button onClick= {delFunc}>Yes</button> 
        <button onClick= { ()=> {setShowConfirm (false)}}>No</button>
      </> 
    )
  }
  return (
    <>
      <button   className="inline-flex items-center px-3 py-1 text-sm leading-none rounded-full font-bold bg-red-100 text-red-700"
      onClick={ () => {setShowConfirm (true)}}>Delete</button> 
    </>
  )
}





/*
Need to assign unique key for rendering (server-assigned id not available yet) ; 
Note also that update/delete are disable until client receives server response -- https://dataclient.io/rest/guides/optimistic-updates
*/

const renderKeyMap: Map < Application, string> = new Map ()
const getApplicationKey= (app: Application) => {
  if (app.id== undefined) {
    if (renderKeyMap.has (app) ) {
      return renderKeyMap.get (app)
    }
    const id= crypto.randomUUID ()
    renderKeyMap.set ( app, id)
    return id 
  }
  return app.id 

}


function AppList (  
  {data, loading}: {data: Application [] | undefined, loading: boolean}
) {
  

  const [editItem, setEditItem]= useState<applicationType|null>  (null)
  const controller= useController () ; 
  const deleteMutation= (objData: Application) => { 
    //Reject delete if we still don't have the id from server 
    if (objData.id== undefined) return
    controller.fetch (AppResourceDelete, {id:objData.id})
  }

  //TODO: Format: Date-Salary-  changing status format 
  return (
    <> 
  
      {loading && <div>Loading...</div>}
     <div className='max-w-4xl mx-auto flex flex-col mt-35 '>
      {
        !loading && data?.map ( 
          (item: Application) => {
            return (
              <div className= "grid grid-cols-[3fr_2fr_1fr_1fr_4fr] max-w-4xl gap-2 bg-white mb-2.5 px-2.5 py-2.5 rounded font-sans items-center" key= {getApplicationKey (item) }> 
                <div className="gap-1.5"> 
                  <div className="font-bold text-lg">{item["company"]}  </div>
                  <div> {item["role"]} </div>
                  <div> {item["jobUrl"]} </div>
                </div> 

                <div className="flex flex-row gap-2 h-max w-max bg-green-100 rounded-2xl px-1 py-1"> {item["status"]} </div> 

                <div className="flex flex-row gap-2 h-max w-max"> {item["applicationDate"]?.slice (0, 10)}</div> 
                
                <div className="flex flex-row gap-2 h-max w-max"> {item["salaryMin"]}-{item["salaryMax"]}</div> 

                <div className="flex flex-row gap-2 items-center justify-center"> 
                  <DeleteBar delFunc= {()=> deleteMutation (item)}></DeleteBar>
                  <button onClick={ ()=> setEditItem (item)}>Edit</button>
                </div> 
            </div> 
            )
          }
        )
      }
      { 
        editItem &&  <EditModal itemEdit={editItem} setEditItem ={setEditItem} createFlag= {false} actionText= {"Edit"}></EditModal>
      }

     </div>
    </> 
  ) 
}//SEE: Stretching on DeleteBar div without items-center








function OptTab  () {

  const controller= useController ()
  const [inputError, setInputError]= useState (false)
  
  //if paraCursor null, no more to show 
  const  onQuickAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault ()
    setInputError (false) 

    const createMutation= (objData: applicationType) => {
      controller.fetch (AppResourcePush, objData)
    }
    const formData= new FormData (event.currentTarget) 

    const objData=  {
      company: (formData.get ("Company") as string) ,  
      role: ( formData.get ("Role") as string), 
      status:  emptyApplication.status,
      applicationDate: emptyApplication.applicationDate,
      jobUrl: emptyApplication.jobUrl,
      salaryMin: emptyApplication.salaryMin,
      salaryMax: emptyApplication.salaryMax,
      notes: emptyApplication.notes, 
    } as applicationType

    const parsedObj= schemaPostApplication.safeParse (objData)
    if (parsedObj.success) {} 
    else {
      console.log (parsedObj.error)
      setInputError (true) 
      return 
    }
    createMutation (objData)

  }

  const [curPage, setCurPage] = useState (1) 
  const [limitPerPage, setLimitPerPage]= useState (5)
  const [addItem , setAddItem] = useState <applicationType|null> (null)
  const curCursor= useRef<string|null> (null)
  const appDataEndpoint= new All (Application)
  const cacheStore= useQuery (appDataEndpoint)
  const loadingState= useRef<boolean>  (false)
  const [loading, setLoading] = useState(false)

  //sort and slice 
  let cacheStoreSliced= cacheStore?.slice ((curPage-1)*limitPerPage, (curPage-1)*limitPerPage+limitPerPage)

  //Initial fetch (Note: this is needed for when reloading the page)
  useEffect (
    ()=>{
      const load = async ()=> {
        const res= await controller.fetch (AppResourceReadPage, {limit:FETCH_SIZE})
        curCursor.current= res.nextCursor
      }
      load ()
    }
    , []
  )

  if (!curCursor.current) curCursor.current= updatedCursor 

  let numItems: number| null |undefined=FETCH_SIZE
  numItems= cacheStore?.length ?? FETCH_SIZE

  const analyzePage = (curPage: number, limit: number)=> {
    //Not sufficient data
    if (curPage*limit>numItems) {
      return false
    }
    return true 
  }


  const fcache= async (curCursor: string| null )=> {
    
    if (!curCursor) {
      return {
        nextCursor:null
      } 
    }

    try {

      const res= await controller.fetch(
        AppResourceReadPage,
        {
          limit: FETCH_SIZE,
          cursor: curCursor,
        }
      )

      return res
    }
    catch (error) {
      throw error
    }
  }
  
  //Set state to avoid double-clicking 
  const onNextPage= (curPage: number )=> {

    if (loadingState.current) return 

    if (!analyzePage (curPage, limitPerPage) ) {
      loadingState.current= true 
      setLoading (true)
    }
    else {
      loadingState.current= false 
      setLoading (false)
    }
  }

  useEffect ( () => {

    if (!analyzePage (curPage, limitPerPage) ){

      //refetch  from server ; fetching can be checked elsewhere to indicate page is being loaded from server 
      const load = async () => {
        try {
          const res  = await fcache (curCursor.current)
          curCursor.current= res.nextCursor
        
        }
        finally {
          loadingState.current= false 
          setLoading (false)
        }
      } 

      load ()
     
    }
    else {}//render normally (entries already computed in cacheStoreSliced)

    
    
  }, [curPage, limitPerPage])


  //Log out 
  const navigate= useNavigate ()
  const {isPending, mutate }= useMutation (
    {
      mutationFn: async () => {
        const res= await fetch ('/api/auth/logout', {
          method: "POST", 
          credentials: "include", 
          headers: {
            "Content-type": "Application/json"
          }
        })
      
        if (res.status!=204) {
          console.log ("Error code: at logout ", res.status)
          throw new Error ()
        }
      }, 
      onSuccess: () => {
        console.log ('Exiting... ')
        navigate ('/')
      }
    }
    
  )
  const handleLogout =  ()=> {
    //Mutate 
    mutate()
  }


  return (
      <> 
     
      <header> 
      <div className= "flex flex-row justify-between"> 
        <div className= "px-3 py-3 text-2xl font-bold"> Joba</div>
        <button className="px-5 py-5 justify-end items-end" onClick= {()=> {handleLogout()}}> Log out </button> 
        <div> {isPending && <>Exiting...  </> } </div> 
      </div>
      </header> 
      
      <div className=" flex flex-row justify-between max-w-4xl mx-auto "> 
        <div className= "flex flex-col p-2"> 
          <h2 className= "text-4xl font-bold "> Applications </h2> 
          <span> </span> 
        </div>

        <div className='flex items-center justify-center px-3'>
          <button  className=" bg-orange-500 font-semibold text-xs text-white rounded border border-orange-600 hover:bg-orange-600 px-3 py-1.5"
                   onClick= {()=>{setAddItem (emptyApplication)}}> 
            + New Application 
          </button> 
        </div>
      </div>

      { 
        addItem &&  <EditModal itemEdit={addItem} setEditItem ={setAddItem} createFlag= {true} actionText= {"Create"}></EditModal>
      }



      {/* Use mx-auto */}
      <section className="bg-white px-5 py-10 max-w-4xl mx-auto"> 
        <div className="flex flex-col"> 
        
        <h3 className="px-2 py-2 font-bold">Quick add</h3> 

        <form className= "grid grid-cols-[7fr_7fr_1fr] gap-2" onSubmit={onQuickAdd}> 
           <div className= "flex flex-col"> 
             <label htmlFor='Company' className="text-sm font-semibold text-gray-600"> Company</label> 
             <input id="Company" name="Company"  className="text-gray-900 text-sm border border-gray-400 px-2 py-2 rounded-lg w-full" placeholder='e.g. Google Zurich'/> 
           </div> 
           <div className="flex flex-col"> 
             <label htmlFor= 'Role'  className="text-sm font-semibold text-gray-600">Role </label>
             <input id="Role" name="Role" className="text-gray-900 text-sm border border-gray-400 px-2 py-2 rounded-lg w-full" placeholder='e.g. Senior Architect'/>
           </div> 
           <div className="flex flex-col justify-end"> 
            <button  className="bg-orange-500 font-semibold text-xs text-white rounded border border-orange-600 hover:bg-orange-600 px-3 py-1.5"> 
              Save 
            </button> 
           </div>
           <div>
            {inputError && <div> Invalid input; ensure values are correct </div> }
           </div>
        </form> 
  
        </div>
      </section>
      

      {/* We use two variables, one that provides inmediate update (useRef) to facilitate ; 
          and one that causes re-rendering to ensure the buttons appear again after the load is incomplete
      
      */ }
      <AppList data={cacheStoreSliced} loading={false}></AppList>
      <div className='flex flex-row mt-15 justify-center items-center gap-3 '> 
         
     
           {
            !loadingState.current && !loading && 
            <div> 
              <button onClick={ () => { onNextPage(Math.max ( curPage-1, 1));  setCurPage (Math.max ( curPage-1, 1)); } }> back  </button> 
              <button onClick= {()=> {  onNextPage (curPage+1);                setCurPage (curPage+1)}}> next </button>
            </div> 
           }

           {
            !(!loadingState.current && !loading) && 
            <div> Loading...  </div>
           }
           
      
          <div> 
            <h3> {curPage}</h3> 
          </div> 

          <div>
            <label> Entries per page</label>
            <select onChange= { (e) => {setLimitPerPage ( Number (e.target.value)) }} disabled= { !(!loadingState.current && !loading)}>
              <option value="5">5</option> 
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="100">100</option>
            </select> 
          </div>
      </div> 

      </>
  )
}

export default OptTab  ;



//Notes
//To account for updates from other source, need to be able to refresh on /board 

