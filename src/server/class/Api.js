import { solid } from "@randajan/props";
import { Functionable } from "../../arc/class/Functionable";
import { apiResolve } from "./static";
import { mrgObj } from "../../arc/tool";

//options: code, isAsync, timestamp, trait, onError, throwError

export class Api extends Functionable {

    static create(config={}) { return new Api(config); }

    constructor(config={}) {
        
        super((exe, opt)=>apiResolve(exe, mrgObj(config, opt)));

        Object.freeze(config);
        solid(this, "config", config);
    }

    code(code, exe, opt={}) {
        opt.code = code;
        return this(exe, opt);
    }

    extend(config) { return new Api(mrgObj(this.config, config)); }
}