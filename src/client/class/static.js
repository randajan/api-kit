import info from "@randajan/simple-lib/info";
import { solid } from "@randajan/props";
import { isFn, mrgStr } from "../../arc/tool";
import { ApiError } from "../../arc/class/ApiError";
import { buildUrl } from "../../arc/url";
import { diffVersion, end, start } from "../../arc/main";
import { attachBodyDecoder, encodeBody } from "../../arc/types";

const prepareOpt = (url, opt, method)=>{
    start(opt);

    opt.url = buildUrl( mrgStr(opt.url, url), opt.query);

    if (method) { opt.method = method; }

    if (opt.body) { encodeBody(opt); }

    attachBodyDecoder(opt);

    const hasTimeout = opt.timeout > 0;
    if (opt.abortable || hasTimeout) {
        opt.abortController = new AbortController();
        opt.signal = opt.abortController.signal;
    }

    if (hasTimeout) {
        opt.timeoutId = setTimeout(() => opt.abortController?.abort(ApiError.create(1, "Timeout", 408)), opt.timeout);
    }

    if (isFn(opt.trait)) { opt = opt.trait(opt) || opt; }

    return opt;
}

const localReject = (opt, error)=>{
    const { httpStatusCode } = error;

    error.rise(0).rise(opt.code || 0);

    return end({ isOk:false, isRemote:false, isApiKit:false, statusCode: httpStatusCode, error }, opt);
}

const statusError = ({ status, statusText })=>ApiError.create(4, statusText || status, status);
const unreadableError = resp=>resp.ok ? ApiError.create(3, "Unreadable", 415) : statusError(resp);
const foreignError = resp=>({ isApiKit:false, error:statusError(resp) });

const readText = async resp=>{
    try { return await resp.text(); }
    catch { throw unreadableError(resp); }
}

const decodeText = (text, opt, resp)=>{
    try { return opt.decodeBody(text); }
    catch { throw unreadableError(resp); }
}

const resolveEmpty = resp=>{
    if (!resp.ok && resp.status !== 304) { return foreignError(resp); }
    return { result:null, isApiKit:false };
}

const resolveApiKit = (raw, opt)=>{
    const apv = raw[info.name];
    const diff = diffVersion(apv);
    const msg = `Detected @randajan/api-kit ${diff} version difference at '${opt.url}'. Server '${apv}' vs. client '${info.version}'`;

    if (diff === "major") { console.error(msg); }
    if (diff === "minor") { console.warn(msg); }

    raw.isApiKit = true;
    return raw;
}

const resolveForeign = (raw, opt, resp)=>{
    if (!resp.ok) { return foreignError(resp); }

    const body = { isApiKit:false };

    try { body.result = opt.parseBody(raw); }
    catch(err) { body.error = err.message || err; }

    return body;
}

const resolveDecoded = (raw, opt, resp)=>{
    if (raw?.[info.name]) { return resolveApiKit(raw, opt); }
    return resolveForeign(raw, opt, resp);
}

const normalizeError = (body, opt, resp)=>{
    if (!body.error || ApiError.is(body.error)) { return; }

    const { code, message, stack, httpStatusCode } = body.error;
    body.error = ApiError.create(
        code || mrgStr(opt.code || 0, "1.0", "."),
        message || body.error,
        httpStatusCode ?? body.statusCode ?? resp.status,
        stack
    );
}

const remoteResolve = (body, opt, resp)=>{
    normalizeError(body, opt, resp);

    body.isOk = !body.error;
    body.isRemote = true;
    body.isApiKit = !!body.isApiKit;
    body.statusCode = body.statusCode ?? body.error?.httpStatusCode ?? resp.status;

    if (opt.parseHeaders) {
        body.headers = Object.freeze(Object.fromEntries(resp.headers.entries()));
    }

    return end(body, opt);
}

const remoteReject = (opt, resp, error)=>remoteResolve({ isApiKit:false, error }, opt, resp);

const fetchExe = async (_fetch, opt) => {

    let resp, body;

    try { resp = await _fetch(opt.url, opt); }
    catch (err) { return localReject(opt, ApiError.is(err) ? err : ApiError.to(0, "Failed", 503)); }

    try {
        const text = await readText(resp);
        body = text ? resolveDecoded(decodeText(text, opt, resp), opt, resp) : resolveEmpty(resp);
    } catch (err) {
        return remoteReject(opt, resp, ApiError.is(err) ? err : ApiError.to(0, err, 500));
    }

    return remoteResolve(body, opt, resp);
};

export const fetchResolve = (_fetch, url, opt, method)=>{
    const prom = fetchExe(_fetch, prepareOpt(url, opt, method));

    if (opt.timeoutId) { prom.finally(_=>clearTimeout(opt.timeoutId)); }
    if (!opt.abortable) { return prom; }

    return solid(prom, "abort", _=>opt.abortController?.abort(ApiError.create(2, "Aborted", 499)));
}
