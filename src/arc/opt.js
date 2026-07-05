import { solids } from "@randajan/props";
import { isFn } from "./tool";


export const start = (opt)=>{
    if (opt.timetrack) { return opt.startAt = Date.now(); }
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
    const hasError = !!body.error;

    endTime(body, opt.startAt);

    if (!hasError){
        if (isFn(opt.onOk)) { opt.onOk(body, opt); }
    } else {
        if (isFn(opt.onError)) { opt.onError(body, opt); }
        if (opt.throwError) { throw body.error; }
    }

    return Object.freeze(body);
}

export const createTrait = (trait)=>{
    if (!trait) { return opt=>opt; }
    if (isFn(trait)) { return trait; }
    throw new Error("config.trait should be a function");
}

export const configTrait = (config)=>{
    config.trait = createTrait(config.trait);
}
