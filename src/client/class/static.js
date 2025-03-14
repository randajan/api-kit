import { solid } from "@randajan/props";
import { buildUrl, mrgStr } from "../../arc/tool";
import { ApiError } from "../../arc/class/ApiError";

export const fetchExtra = (_fetch, url, opt, method)=>{

    if (method) { opt.method = method; }
    opt.headers['Accept'] = 'application/json';

    if (opt.body) {
        opt.headers["Content-Type"] = "application/json";
        opt.body = JSON.stringify(opt.body);
    }

    const hasTimeout = opt.timeout > 0;
    if (opt.abortable || hasTimeout) {
        opt.abortController = new AbortController();
        opt.signal = opt.abortController.signal;
    }

    let int;
    if (hasTimeout) {
        int = setTimeout(() => opt.abortController?.abort(new ApiError(1, "Timeout")), opt.timeout);
    }

    if (opt.trait) { opt = opt.trait(opt); }

    const prom = fetchExe(_fetch, url, opt);

    if (hasTimeout) { prom.finally(_=>clearTimeout(int)); }
    if (!opt.abortable) { return prom; }

    return solid(prom, "abort", _=>opt.abortController?.abort(new ApiError(2, "Aborted")));

}

const fetchExe = async (_fetch, url, opt) => {

    let resp, body;

    try { resp = await _fetch(buildUrl(url, opt.params), opt); }
    catch (err) { return localReject(opt, ApiError.is(err) ? err : ApiError.to(0, "Failed")); }

    const { ok, status, headers, statusText } = resp;

    try { body = await resp.json(); }
    catch { return localReject(opt, new ApiError(ok?3:4, ok?"Unreadable" : (statusText || status)), status); }

    body.ok = !body.error;
    body.status = status;

    if (body.error) {
        const { code, message } = body.error;
        body.error = new ApiError(code || mrgStr(opt.code || 0, "1.0", "."), message || body.error );
    }
    
    if (opt.attachHeaders) {
        body.headers = Object.freeze(Object.fromEntries(headers.entries()));
    }
    
    return Object.freeze(body);
};



export const localReject = (opt, error, status)=>{
    const { code } = error;

    if (code == 0) { status = 503 } //failed
    else if (code == 1) { status = 408; } //timeout
    else if (code == 2) { status = 499; } //aborted
    else if (code == 3) { status = 415; } //unreadable

    error.rise(0).rise(opt.code || 0);
    return Object.freeze({ ok:false, status, error });
}