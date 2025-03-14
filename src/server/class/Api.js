import { solid } from "@randajan/props";
import { Functionable } from "../../arc/class/Functionable";
import { apiAsync, apiSync } from "./static";
import { mrgOpt } from "../../arc/tool";




export class Api extends Functionable {

    static create(config={}) { return new Api(config); }

    constructor(config={}) {
        
        const { isSync } = config;

        super(isSync ? (code, exe)=>apiSync(config, code, exe) : (code, exe)=>apiAsync(config, code, exe));

        Object.freeze(config);
        solid(this, "config", config);
    }

    extend(config) { return new Api(mrgOpt(this.config, config)); }
}