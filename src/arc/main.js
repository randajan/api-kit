import { solids } from "@randajan/props";
import { isFn, toStr } from "./tool";
import { info } from "@randajan/simple-lib/info";


export const start = (opt)=>{
    if (opt.timestamp) { return opt.startAt = Date.now(); }
}

const endTime = (body, startAt)=>{
    if (!startAt) { return; }

    const endAt = Date.now();
    const time = {
        startAt,
        endAt,
        run:endAt-startAt
    }

    if (body.time) {
        time.srvRun = body.time.run;
        time.netIn = body.time.startAt - startAt;
        time.netOut = endAt - body.time.endAt;
    }

    body.time = solids({}, time);
}

export const end = (body, opt)=>{
    if (!body.error){
        if (isFn(opt.onOk)) { opt.onOk(body, opt); }
    } else {
        if (isFn(opt.onError)) { opt.onError(body, opt); }
        if (opt.throwError) { throw body.error; }
    }

    endTime(body, opt.startAt);
    return opt.resultOnly ? body.result : Object.freeze(body);
}

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