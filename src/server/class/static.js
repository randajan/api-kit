import info from "@randajan/simple-lib/info";
import { ApiError } from "../../arc/class/ApiError"
import { start, end } from "../../arc/main";
import { isFn, isProm } from "../../arc/tool";
import { tryFn, tryFnAsync } from "../tool";


const apiExit = (resp, opt)=>{
    if (resp.error) { resp.error = ApiError.to(0, resp.error).rise(1).rise(opt.code); }
    resp[info.name] = info.version;
    return end(resp, opt);
}

const apiAsync = async (exe, opt)=>apiExit(await tryFnAsync(exe), opt);

export const apiResolve = (exe, opt)=>{
    start(opt);

    opt = opt.trait(opt) || opt;

    if (opt.isAsync) { return apiAsync(exe, opt); }

    const resp = tryFn(exe);
    if (!isProm(resp)) { return apiExit(resp, opt); } 
    return resp.then((resp)=>apiExit(resp, opt));
}