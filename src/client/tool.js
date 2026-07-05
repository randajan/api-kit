import { info } from "@randajan/simple-lib/info";
import { FetchError } from "../arc/class/FetchError";
import { HttpError } from "../arc/class/HttpError";
import { start } from "../arc/opt";
import { isFn, mrgObj, mrgStr, toStr } from "../arc/tool";
import { attachBodyDecoder, encodeBody } from "../arc/types";
import { buildUrl } from "./url";

export const diffVersion = (version)=>{
    const v1 = toStr(info.version);
    const v2 = toStr(version);

    if (v1 === v2) { return }

    const f1 = v1.split(".");
    const f2 = v2.split(".");

    if (f1[0] !== f2[0]) { return "major"; }
    if (f1[1] !== f2[1]) { return "minor"; }
    if (f1[2] !== f2[2]) { return "patch"; }
}


export const failedError = cause=>FetchError.code(1, "Failed", { cause });
export const timeoutError = _=>FetchError.code(2, "Timeout");
export const abortError = _=>FetchError.code(3, "Aborted");
export const statusError = resp=>HttpError.code(4, resp.statusText, resp.status, { exposeCause:true });
export const unreadableError = (resp, cause)=>resp.ok ? FetchError.code(5, "Unreadable", { cause }) : statusError(resp);
export const undecodableError = (resp, cause, detail)=>resp.ok ? FetchError.code(6, "Undecodable", { cause, detail }) : statusError(resp);

export const parseHeaders = (resp, opt)=>{
    if (!resp || !opt.parseHeaders) { return; }
    return Object.freeze(Object.fromEntries(resp.headers.entries()));
}

export const readText = async resp=>{
    try { return await resp.text(); }
    catch(err) { throw unreadableError(resp, err); }
}

export const decodeText = (resp, opt, text)=>{
    try { return opt.decodeBody(text); }
    catch(err) { throw undecodableError(resp, err, text); }
}

export const normalizeClientError = (any, opt)=>{
    let err = any;

    if (!FetchError.is(err)) {
        let custom = isFn(opt.normalizeError);
        if (custom) {
            try { err = opt.normalizeError(err, opt); }
            catch { custom = false; }
        }
        if (!custom || !FetchError.is(err)) {
             err = FetchError.code(0, "Unknown", { cause:any });
        }
    }

    return err.rise(0).rise(0);
}

export const reconstructApiError = (remoteErr)=>{
    if (!remoteErr) { return; }
    const { message, code, httpStatusCode, cause, detail } = remoteErr;
    return HttpError.code(code, message, httpStatusCode, { cause, detail, exposeCause:true });
}

export const mrgOpt = (a, b)=>{
    const opt = mrgObj(a, b);

    opt.body = mrgObj(a?.body, b?.body);
    opt.params = mrgObj(a?.params, b?.params);
    opt.headers = mrgObj(a?.headers, b?.headers, {});

    return opt;
}

export const prepareOpt = (url, opt, method)=>{

    start(opt);

    opt.url = buildUrl( mrgStr(opt.url, url), opt.params);
    if (method) { opt.method = method; }

    if (opt.body) { encodeBody(opt); }

    attachBodyDecoder(opt);

    const hasTimeout = opt.timeout > 0;
    if (opt.isAbortable || hasTimeout) {
        opt.abortController = new AbortController();
        opt.signal = opt.abortController.signal;
    }

    if (hasTimeout) {
        opt.timeoutId = setTimeout(() => opt.abortController?.abort(timeoutError()), opt.timeout);
    }

    if (isFn(opt.trait)) { opt = opt.trait(opt) || opt; }

    return opt;
}
