import { solids } from "@randajan/props";
import { isFn } from "./tool";


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
    return Object.freeze(body);
}