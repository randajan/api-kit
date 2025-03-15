import { solid } from "@randajan/props";
import { isFn, mrgStr } from "../../arc/tool";
import { ApiError } from "../../arc/class/ApiError";
import { buildUrl } from "../../arc/url";
import { end, start } from "../../arc/main";

const prepareOpt = (opt, method)=>{
    start(opt);

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

    if (hasTimeout) {
        opt.timeoutId = setTimeout(() => opt.abortController?.abort(new ApiError(1, "Timeout")), opt.timeout);
    }

    if (isFn(opt.trait)) { opt = opt.trait(opt) || opt; }

    return opt;
}

const localReject = (opt, error, http)=>{
    const { code } = error;

    if (code == 0) { http = 503 } //failed
    else if (code == 1) { http = 408; } //timeout
    else if (code == 2) { http = 499; } //aborted
    else if (code == 3) { http = 415; } //unreadable
    else if (!http) { http = 400; }

    error.rise(0).rise(opt.code || 0);

    return end({ ok:false, http, error }, opt);
}

const fetchExe = async (_fetch, url, opt) => {

    let resp, body;

    try { resp = await _fetch(buildUrl( mrgStr(opt.url, url), opt.query), opt); }
    catch (err) { return localReject(opt, ApiError.is(err) ? err : ApiError.to(0, "Failed")); }

    const { ok, status, headers, statusText } = resp;

    try { body = await resp.json(); }
    catch { return localReject(opt, new ApiError(ok?3:4, ok?"Unreadable" : (statusText || status)), status); }

    if (body.error) {
        const { code, message } = body.error;
        body.error = new ApiError(code || mrgStr(opt.code || 0, "1.0", "."), message || body.error );
    }

    body.ok = !body.error;
    body.http = status;

    if (opt.parseHeaders) {
        body.headers = Object.freeze(Object.fromEntries(headers.entries()));
    }
    
    return end(body, opt);
};

export const fetchResolve = (_fetch, url, opt, method)=>{
    const prom = fetchExe(_fetch, url, prepareOpt(opt, method));

    if (opt.timeoutId) { prom.finally(_=>clearTimeout(opt.timeoutId)); }
    if (!opt.abortable) { return prom; }

    return solid(prom, "abort", _=>opt.abortController?.abort(new ApiError(2, "Aborted")));
}