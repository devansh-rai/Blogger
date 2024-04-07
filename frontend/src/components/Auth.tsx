/* eslint-disable @typescript-eslint/no-unused-vars */
import {Link,useNavigate} from "react-router-dom";
import {useState} from "react";
import {SignupInput} from "@devansh-rai/medium-zod/dist";   
import axios from "axios";
import {BACKEND_URL} from "../../config.ts";

function Auth({type}:{type:"signin" | "signup"})
{
    const navigate = useNavigate();
    const [postInputs,setPostInputs] = useState<SignupInput>({
        name : "",
        email: "",
        password: "",
    });

    async function sendRequest()
    {
        try{
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type==="signin"?"signin":"signup"}`,postInputs);
            const jwt = response.data;
            // console.log(jwt.token);
            localStorage.setItem("token",jwt.token);
            localStorage.setItem("Name",postInputs.name);
            navigate("/blogs");
        }
        catch(e){
            console.log(e);
        }
    }

    return (
        <div className="h-screen flex flex-col justify-center">
            <div className="flex justify-center">
                <div>
                    <div className="px-10">
                        <div className="text-3xl font-extrabold">
                            Create an account
                        </div>
                        <div className="text-slate-400">
                            {type==="signup"?"Already have an account?":"Don't have an account?"}
                            <Link to={type==="signup" ? "/signin" : "/signup"} className="text-blue-500 hover:text-opacity-50 pl-2 underline" >{type==="signin" ? "Signup" : "Login"}</Link>
                        </div>
                    </div>
                    {type==="signup" ? <div className="pt-4">
                        <LabelledInput label="Name" placeholder="Enter your name" onChange={(e) => setPostInputs({...postInputs,name:e.target.value})}/>
                    </div> : null}
                    <div>
                        <LabelledInput label="Email" placeholder="Enter your email" onChange={(e) => setPostInputs({...postInputs,email:e.target.value})}/>
                    </div>
                    <div>
                        <LabelledInput label="Password" placeholder="Enter your password" onChange={(e) => setPostInputs({...postInputs,password:e.target.value})}/>
                    </div>
                    <button onClick={sendRequest} type="button" className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mt-3">{type==="signin" ? "Sign in" : "Sign up"}</button>


                </div>
            </div>
        </div>
    );
}

interface LabelledInputType {
    label : string;
    placeholder : string;
    onChange : (e: React.ChangeEvent<HTMLInputElement>) => void;
    type ?: string;
}

function LabelledInput({label,placeholder,onChange}:LabelledInputType)
{
    return  (
        <div>
            <label className="block mb-2 text-sm font-bold pt-3 text-black">{label}</label>
            <input onChange={onChange} type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} required />
        </div>
    );
}



export default Auth;