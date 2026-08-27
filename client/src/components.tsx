
import { PasswordInput } from '@mantine/core';
import type { FormEventHandler, MouseEventHandler } from "react";
import { useNavigate } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import  type { applicationType } from "./query";

//TODO: Not currently imported, but consider using it for modularity (technical debt)
export function ButtonComponent ( {text} : {
    text: string 
}) {
    return(
        <button className='bg-orange-600  text-white font-bold w-full flex justify-center items-center rounded-md'> 
          {text}
        </button> 
    )
}



export function SignLogComponent({
    handleSubmit, 
    handleForgotPass, 
    handleExit, 
    isLoading, 
    isError,
    isSuccess,  
    textOpt, 
    text1Placeholder, 
    text2Placeholder, 
    text3Placeholder,
    buttonText, 
    textError, 
    type1, 
    type2, 
    type3, 
    name1,
    name2, 
    name3,
    successMessage, 
    redirectToLogIn
  }: 

    {handleSubmit?: FormEventHandler<HTMLFormElement>; 
        handleForgotPass?: MouseEventHandler<HTMLButtonElement> ; 
        handleExit?: MouseEventHandler<HTMLButtonElement> ; 
        isLoading?: boolean; 
        isError?: boolean; 
        isSuccess?: boolean ; 
        textOpt?: string; 
        text1Placeholder?: string; 
        text2Placeholder?: string; 
        text3Placeholder?: string; 
        buttonText?: string; 
        textError?: string, 
        type1?: string,
        type2?: string,
        type3?: string,
        name1?: string,
        name2?: string,
        name3?: string,
        successMessage?: string
        redirectToLogIn?: boolean
        
    }) {

        const navigator= useNavigate ()

   
        //Password button is rendered using mantine ; we break down case by case 
        return (
      <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50">
        <div className="absolute flex items-center justify-center text-black">
          <form className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white p-10 md:p-20" onSubmit={handleSubmit}>
            
            {handleExit &&<button type="button" className="absolute right-2 top-1 text-7xl font-bold" onClick={handleExit}>X </button>  }
  
           
            {
              !isSuccess && (
                <>
                     <div className= "flex flex-col gap-3 w-[300px]">
                      {type1 && type1!="password" &&  <input className="py-1 px-15 rounded-md bg-white text-center border-2 outline-none focus:ring-3 focus:border-orange-500 focus:ring-orange-500"
                       type={type1} id={name1} name={name1} placeholder= {text1Placeholder}/>}
                      {type2 && type2!="password" &&  <input className="py-1 px-15 rounded-md bg-white text-center border-2 outline-none focus:ring-3 focus:border-orange-500 focus:ring-orange-500 " type={type2} id={name2} name={name2} placeholder= {text2Placeholder} />}
                      {type3 && type3!= "password" && <input className="py-1 px-15 rounded-md bg-white text-center border-2 outline-none focus:ring-3 focus:border-orange-500 focus:ring-orange-500 " type={type3} id={name3} name={name3} placeholder= {text3Placeholder} />}
                     
                      {type1 && type1=="password" && 
                        <PasswordInput  id={name1} name={name1} placeholder= {text1Placeholder}
                          classNames= {
                            {
                              input:
                              "w-full"+
                              "rounded-md bg-white border-2 border-black outline-none " +
                              "focus-within:ring-3 focus-within:border-orange-500 focus-within:ring-orange-500",
                      
                              innerInput:
                                "py-1 px-15 text-center bg-transparent"
                            }
                          }
                        />

                      }
                      
                      {type2 && type2=="password" && <PasswordInput  id={name2} name={name2} placeholder= {text2Placeholder} 
                        classNames= {
                          {
                            input:
                            "w-full"+
                            "rounded-md bg-white border-2 border-black outline-none " +
                            "focus-within:ring-3 focus-within:border-orange-500 focus-within:ring-orange-500",
                    
                            innerInput:
                              "py-1 px-15 text-center bg-transparent"
                          }
                        }
                      />
                      
                      }
                      {type3 && type3=="password" && <PasswordInput  id={name3} name={name3} placeholder= {text3Placeholder}
                        classNames= {
                          {
                            input:
                            "w-full"+
                            "rounded-md bg-white border-2 border-black outline-none " +
                            "focus-within:ring-3 focus-within:border-orange-500 focus-within:ring-orange-500",
                    
                            innerInput:
                              "py-1 px-15 text-center bg-transparent"
                          }
                        }
                      />
                      
                     }

                    </div>
                    {buttonText&& <button type="submit" className="mt-5 flex py-1 px-15  items-center justify-center font-extrabold rounded-md bg-black p-2 hover:bg-orange-500 text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={isLoading}>
                      {buttonText}
                    </button>
                    }
                </>
              )
            }
           


            {isError && (
              <div className="text-sm text-red-500">
                 {textError}
              </div>
            )}
  
            {isLoading && <div> Loading ...</div>}

            {isSuccess  && !redirectToLogIn &&
              <> 
                <div className="p-10 font-semibold text-xl"> 
                  {successMessage} 
                </div>
              </>
            }

            {isSuccess && redirectToLogIn && 
              <> 
                <div  className="p-10 font-semibold text-xl"> 
                  {successMessage} 
                </div>
                <button onClick={ ()=> { navigator ('/login') }}> Click here to log in </button>
              </>  
            }

            {textOpt&& <button type="button" className="mt-2 text-sm underline" onClick={handleForgotPass}>  {textOpt} </button>}
  
          </form>
        </div>
      </div>
    );
  } 




export function EditAppComponent({
    onUpdate,
    editVar,
    setEditVar,
    STATUS_OPTS,
    setEditItem, 
    actionText, 
    inputError
  }: {
    onUpdate: FormEventHandler<HTMLFormElement>;
    editVar: applicationType | null;
    setEditVar: Dispatch<SetStateAction<applicationType | null>>;
    STATUS_OPTS: string[];
    setEditItem: (value: null) => void;
    actionText: string ; 
    inputError: boolean;
    //setInputError: (value: null) => void 
  }) {

  return ( //max-w-2xl
    <div className="fixed flex w-full  mx-auto inset-0  z-100 bg-black/30  p-8 ">
      <div className=" flex w-full max-w-lg center-items justify-center  mx-auto h-fit z-100 bg-white  text-black  rounded-xl px-10 py-10 gap-10">
        <form className="flex flex-col gap-4" onSubmit={onUpdate}>

          <div className="flex flex-col">
            <span className="text-lg font-bold">
              {actionText} application
            </span>
            <span className="text-gray-500 text-xs">
              {actionText} the details below as you see fit.
            </span>
          </div>

          <div className="flex flex-col items-start justify-start gap-1">
            <label htmlFor="Company" className="font-semibold text-xs text-gray-700">Company</label>
            <input
              value={editVar?.company ?? ""}
              id="Company"
              name="Company"
              className="text-gray-900 text-sm border border-gray-400 px-2 py-1 rounded-lg w-full"
              onChange={(e) => {
                setEditVar((prev) =>
                  prev ? { ...prev, company: e.target.value } : null
                );
              }}
            />
          </div>

          <div className="flex flex-col items-start justify-start gap-1 top-2">
            <label htmlFor="Role" className="font-semibold text-xs text-gray-700">Role</label>
            <input
              value={editVar?.role ?? ""}
              id="Role"
              name="Role"
              className="text-gray-900 text-sm border border-gray-400 px-2 py-1 rounded-lg w-full"
              onChange={(e) => {
                setEditVar((prev) =>
                  prev ? { ...prev, role: e.target.value } : null
                );
              }}
            />
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-2">
            <div className="flex flex-col items-start justify-start gap-1">
              <label htmlFor="Status" className="font-semibold text-xs text-gray-700">Status</label>

              <select
                id="Status"
                name="Status"
                className="text-gray-900 text-sm border border-gray-400 px-2 py-1 rounded-lg w-full"
                onChange={(e) => {
                  setEditVar((prev) =>
                    prev ? { ...prev, status: e.target.value } : null
                  );
                }}
              >
                <option value="">{editVar?.status ?? ""}</option>

                {STATUS_OPTS.filter((item) => {
                  return item != editVar?.status;
                }).map((item) => {
                  return <option key={item} value={item}>{item}</option>;
                })}
              </select>
            </div>

            <div className="flex flex-col items-start justify-start gap-1">
              <label htmlFor="applicationDate" className="font-semibold text-xs text-gray-700">Application Date</label>

              <input
                type="date"
                //value={editVar?.applicationDate?.split("T")[0]}
                value={editVar?.applicationDate?.split("T")[0] ?? ""}
                id="applicationDate"
                name="applicationDate"
                className="text-gray-900 text-sm border border-gray-400 px-2 py-1 rounded-lg w-full"
                onChange={(e) => {
                  setEditVar((prev) =>
                    prev ? { ...prev, applicationDate: e.target.value } : null
                  );
                }}
              />
            </div>
          </div>

          <div className="flex flex-col items-start justify-start gap-1">
            <label htmlFor="jobUrl" className="font-semibold text-xs text-gray-700">Job URL</label>

            <input
              value={editVar?.jobUrl ?? ""}
              id="jobUrl"
              name="jobUrl"
              className="text-gray-900 text-sm border border-gray-400 px-2 py-1 rounded-lg w-full"
              onChange={(e) => {
                setEditVar((prev) =>
                  prev ? { ...prev, jobUrl: e.target.value } : null
                );
              }}
            />
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-2">
            <div className="flex flex-col items-start justify-start gap-1">
              <label htmlFor="salaryMin" className="font-semibold text-xs text-gray-700">Min salary</label>

              <input
                value={editVar?.salaryMin ?? ""}
                id="salaryMin"
                name="salaryMin"
                className="text-gray-900 text-sm border border-gray-400 px-2 py-1 rounded-lg w-full"
                onChange={(e) => {
                  setEditVar((prev) =>
                    prev ? { ...prev, salaryMin: Number(e.target.value) } : null
                  );
                }}
              />
            </div>

            <div className="flex flex-col items-start justify-start gap-1">
              <label htmlFor="salaryMax" className="font-semibold text-xs text-gray-700">Max salary</label>

              <input
                value={editVar?.salaryMax ?? ""}
                id="salaryMax"
                name="salaryMax"
                className="text-gray-900 text-sm border border-gray-400 px-2 py-1 rounded-lg w-full"
                onChange={(e) => {
                  setEditVar((prev) =>
                    prev ? { ...prev, salaryMax: Number(e.target.value) } : null
                  );
                }}
              />
            </div>
          </div>

          <div className="flex flex-col items-start justify-start gap-1">
            <label htmlFor="Notes" className="font-semibold text-xs text-gray-700">Notes</label>

            <textarea
              value={editVar?.notes ?? ""}
              id="Notes"
              name="Notes"
              className="text-gray-900 text-sm border border-gray-400 px-2 py-1 rounded-lg w-full"
              onChange={(e) => {
                setEditVar((prev) =>
                  prev ? { ...prev, notes: e.target.value } : null
                );
              }}
            />
          </div>

          <div className="flex justify-end items-center py-4 gap-2">
            <button type="button" className="bg-white font-semibold text-xs text-gray-700 rounded border border-gray-400 hover:bg-gray-100 px-3 py-1.5" onClick={() => { setEditItem(null); }}>
              Cancel
            </button>

            <button type="submit" className="bg-orange-500 font-semibold text-xs text-white rounded border border-orange-600 hover:bg-orange-600 px-3 py-1.5">
              Save
            </button>

            {inputError && <div> Invalid input; ensure values are correct  </div> }
          </div>

        </form>
      </div>
    </div>
  );
}