import { mrgObj } from "../arc/tool";

export const mrgOpt = (a, b)=>{
    const opt = mrgObj(a, b);

    opt.body = mrgObj(a?.body, b?.body);
    opt.params = mrgObj(a?.params, b?.params);
    opt.headers = mrgObj(a?.headers, b?.headers, {});

    return opt;
}