import { fetchResolve } from "./static";
import { Functionable } from "../../arc/class/Functionable";
import { solid } from "@randajan/props";
import { mrgOpt } from "../tool";
import { configTrait } from "../../arc/opt";

//config: code, url, fetch, query, parseHeaders, trait, timestamp, onError

export class Fetch extends Functionable {

    static create(config={}) { return new Fetch(config) }

    constructor(config = {}) {
        
        const _fetch = config.fetch || globalThis.fetch;

        if (!_fetch) { throw new Error("Missing fetch function. Please provide it inconfig"); }

        configTrait(config);

        delete config.fetch;

        super((url, opt, method) =>fetchResolve(_fetch, url, mrgOpt(config, opt), method));

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