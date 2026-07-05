import info from "@randajan/simple-lib/info";
import { solid } from "@randajan/props";
import { end } from "../../arc/opt";
import { diffVersion, abortError, decodeText, failedError, normalizeClientError, parseHeaders, prepareOpt, readText, reconstructApiError, statusError } from "../tool";
import { FetchError } from "../../arc/class/FetchError";


const localReject = (err, opt)=>({ error:normalizeClientError(FetchError.is(err) ? err : failedError(err), opt) });
const remoteReject = (err, opt)=>({ isRemote:true, error:normalizeClientError(err, opt) });

const remoteResolve = async (resp, opt)=>{
    const text = await readText(resp);

    //empty response
    if (!text) {
        if (resp.ok || resp.status === 304) { return { isRemote:true }; }
        throw statusError(resp);
    }

    const body = decodeText(resp, opt, text);
    const ver = body?.[info.name];

    //foreign response
    if (!ver) {
        if (resp.ok) { return { isRemote:true, result:body } }
        throw statusError(resp);
    }

    //apikit response
    body.isRemote = true;
    body.isApiKit = true;
    body.apiKitDiff = diffVersion(ver);
    body.error = reconstructApiError(body.error);

    return body;
}


const fetchBody = async (_fetch, opt) => {
    let resp, body;

    try { resp = await _fetch(opt.url, opt); }
    catch (err) { body = localReject(err, opt); }

    try { body = body || await remoteResolve(resp, opt); }
    catch (err) { body = remoteReject(err, opt); }

    const err = body.error;

    body.isOk = !err;
    body.isRemote = !!body.isRemote;
    body.isApiKit = !!body.isApiKit;
    body.statusCode = err?.httpStatusCode || resp?.status;
    body.headers = parseHeaders(resp, opt);

    body = end(body, opt);

    return opt.resultOnly ? body.result : body;
};


export const executeFetch = (_fetch, url, opt, method)=>{
    opt = prepareOpt(url, opt, method);

    const prom = fetchBody(_fetch, opt);

    if (opt.timeoutId) { prom.finally(_=>clearTimeout(opt.timeoutId)); }
    if (!opt.isAbortable) { return prom; }

    return solid(prom, "abort", _=>opt.abortController?.abort(abortError()));
}
