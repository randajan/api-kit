import { ApiError } from "../../arc/class/ApiError"



export const apiAsync = async (config, code, exe)=>{
    let result, error;

        
    try { result = await (exe instanceof Function ? exe() : exe); }
    catch(err) {
        error = ApiError.to(err);
        if (code != null) { error.rise(code); }
    }

    return Object.freeze({
        result,
        error,
    });

}

export const apiSync = async (config, code, exe)=>{
    let result, error;

        
    try { result = (exe instanceof Function ? exe() : exe); }
    catch(err) {
        error = ApiError.to(err);
        if (code != null) { error.rise(code); }
    }

    return Object.freeze({
        result,
        error,
    });

}