import { HttpError } from "../arc/class/HttpError";
import { doFn, isErr, isFn, isProm } from "../arc/tool";

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


export const normalizeServerError = (any, opt)=>{
    let err = any;

    if (!HttpError.is(err)) {
        let custom = isFn(opt.normalizeError);
        if (custom) {
            try { err = opt.normalizeError(err, opt); }
            catch { custom = false; }
        }
        if (!custom || !HttpError.is(err)) {
             err = HttpError.code(0, "Unknown", 500, { cause:any });
        }
    }

    return err.rise(1).rise(opt.code);
}
