import { doFn, isErr, isProm } from "../arc/tool";

const wrapResult = r=>({[isErr(r) ? "error" : "result"]:r});
const wrapError = error=>({error});

export const tryFnSync = any=>{
    try { return wrapResult(doFn(any)); }
    catch(error) { return {error}; }
}

export const tryFnAsync = async any=>{
    try { return wrapResult(await doFn(any)); }
    catch(error) { return {error}; }
}

export const tryFn = any=>{
    const r = tryFnSync(any);
    if (!isProm(r.result)) { return r; }
    return r.result.then(wrapResult).catch(wrapError);
}