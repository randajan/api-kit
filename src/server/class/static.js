import info from "@randajan/simple-lib/info";
import { start, end } from "../../arc/opt";
import { isProm } from "../../arc/tool";
import { normalizeServerError, tryFn, tryFnAsync } from "../tool";



const apiExit = (resp, opt)=>{
    const { exposeCause } = opt;

    resp.statusCode = 200;

    if (resp.error) {
        resp.error = normalizeServerError(resp.error, opt);
        resp.statusCode = resp.error.httpStatusCode;
        resp.error.exposeCause(!!exposeCause);
    }

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
