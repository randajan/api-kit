import { ApiError } from "../../arc/class/ApiError"



export const apiAsync = async (config, code, exe)=>{
    let result, error;

        
    try { result = await (exe instanceof Function ? exe() : exe); }
    catch(err) { error = ApiError.to(0, err).rise(1).rise(code); }

    if (ApiError.is(result)) { error = result; result = undefined; }

    return Object.freeze({
        result,
        error,
    });

}

export const apiSync = async (config, code, exe)=>{
    let result, error;

        
    try { result = (exe instanceof Function ? exe() : exe); }
    catch(err) { error = ApiError.to(0, err).rise(1).rise(code); }

    return Object.freeze({
        result,
        error,
    });

}