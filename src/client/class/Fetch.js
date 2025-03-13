import { fetchExtra } from "./static";
import { mrgOpt, mrgStr } from "../../arc/tool";
import { Functionable } from "../../arc/class/Functionable";
import { solid } from "@randajan/props";


export class Fetch extends Functionable {

    static create(config={}) { return new Fetch(config) }

    constructor(config = {}) {
        
        const _url = config?.url || "";
        const _fetch = config?.fetch || globalThis.fetch;

        if (!_fetch) { throw Error("Missing fetch function. Please provide it in constructor config"); }

        if (config) {
            delete config.url;
            delete config.fetch;
        }

        super((url, opt, method) =>fetchExtra(_fetch, mrgStr(_url, url), mrgOpt(config, opt), method));

        Object.freeze(config);
        solid(this, "config", config);
    }

    extend(config) { return new Fetch(mrgOpt(this.config, config)); }

    async get(url, opt) { return this(url, opt, "GET"); }
    async post(url, opt) { return this(url, opt, "POST"); }
    async put(url, opt) { return this(url, opt, "PUT"); }
    async delete(url, opt) { return this(url, opt, "DELETE"); }
    async patch(url, opt) { return this(url, opt, "PATCH"); }
    async head(url, opt) { return this(url, opt, "HEAD"); }
    async options(url, opt) { return this(url, opt, "OPTIONS"); }
}