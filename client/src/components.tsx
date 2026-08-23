import type { SubmitEventHandler } from "react"



export function ButtonComponent ( {text} : {
    text: string 
}) {
    return(
        <button className='bg-orange-600  text-white font-bold w-full flex justify-center items-center rounded-md'> 
          {text}
        </button> 
    )
}



import type { FormEventHandler, MouseEventHandler } from "react";
import { useNavigate } from "react-router-dom";

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
    buttonText, 
    textError, 
    type1, 
    type2, 
    name1,
    name2, 
    successMessage}: 

    {handleSubmit: FormEventHandler<HTMLFormElement>; 
        handleForgotPass?: MouseEventHandler<HTMLButtonElement> ; 
        handleExit?: MouseEventHandler<HTMLButtonElement> ; 
        isLoading?: boolean; 
        isError?: boolean; 
        isSuccess?: boolean ; 
        textOpt?: string; 
        text1Placeholder: string; 
        text2Placeholder: string; 
        buttonText: string; 
        textError?: string, 
        type1: string,
        type2?: string,
        name1: string,
        name2?: string,
        successMessage?: string
    }) {

        const navigator= useNavigate ()
    
        return (
      <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50">
        <div className="absolute flex items-center justify-center text-black">
          <form className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white p-20" onSubmit={handleSubmit}>
            
            {handleExit &&<button type="button" className="absolute right-2 top-1 text-lg font-bold" onClick={handleExit}>X </button>  }
  
  
            <input className="h-[30px] w-[300px] rounded-md bg-white text-center" type={type1} id={name1} name={name1}placeholder= {text1Placeholder} />
            {type2 && <input className="h-[30px] w-[300px] rounded-md bg-white text-center" type={type2} id={name2} name={name2} placeholder= {text2Placeholder} />}
  
            <button type="submit" className="mt-5 flex h-[30px] w-[150px] items-center justify-center rounded-md bg-black p-2 text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={isLoading}>
               {buttonText}
            </button>
  
            {isError && (
              <div className="text-sm text-red-500">
                 {textError}
              </div>
            )}
  
            {isLoading && (
              <svg className="h-10 w-10 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}

            {isSuccess && <> {successMessage} <button onClick={ ()=> { navigator ('/login') }}> Click here to log in </button></>  }
  
            {textOpt&& <button type="button" className="mt-2 text-sm underline" onClick={handleForgotPass}>  {textOpt} </button>}
  
          </form>
        </div>
      </div>
    );
  }
//TODO sign up, log in should have their own routes 




import type { Dispatch, SetStateAction } from "react";
import  type { applicationType } from "./query";

export function EditAppComponent({
    onUpdate,
    editVar,
    setEditVar,
    STATUS_OPTS,
    setEditItem
  }: {
    onUpdate: FormEventHandler<HTMLFormElement>;
    editVar: applicationType | null;
    setEditVar: Dispatch<SetStateAction<applicationType | null>>;
    STATUS_OPTS: string[];
    setEditItem: (value: null) => void;
  }) {

  return (
    <div className="absolute flex max-w-2xl mx-auto inset-0 z-100">
      <div className="relative flex max-w-2xl mx-auto h-fit z-100 bg-white text-black rounded-xl px-10 py-10 gap-10">
        <form className="flex flex-col gap-4" onSubmit={onUpdate}>

          <div className="flex flex-col">
            <span className="text-lg font-bold">
              Edit application
            </span>
            <span className="text-gray-500 text-xs">
              Update the details below as you see fit.
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
              Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}