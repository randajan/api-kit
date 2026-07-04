import { mrgObj } from "../arc/tool";

const mrgQuery = opt=>mrgObj(opt?.params, opt?.query);

export const mrgOpt = (a, b)=>{
    const opt = mrgObj(a, b);

    opt.body = mrgObj(a?.body, b?.body);
    opt.query = mrgObj(mrgQuery(a), mrgQuery(b));
    opt.headers = mrgObj(a?.headers, b?.headers, {});

    return opt;
}
