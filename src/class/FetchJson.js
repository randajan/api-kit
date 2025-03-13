import { staticFetchJson } from "../static";
import { mrgOpt, mrgStr } from "../tool";

export class FetchJson extends Function {

    static create(options={}) { return new FetchJson(options) }

    constructor(options = {}) {
        super();

        const _url = options?.url || "";

        const _fetch = options?.fetch || globalThis.fetch;
        if (!_fetch) { throw Error("Missing fetch function. Please provide it in options at new FetchJson({ fetch, ... }) "); }

        if (options) {
            delete options.url;
            delete options.fetch;
        }

        const request = (url, opt, method) =>staticFetchJson(_fetch, mrgStr(_url, url), mrgOpt(options, opt), method)

        return Object.setPrototypeOf(request, this);
    }

    async get(url, opt) { return this(url, opt, "GET"); }
    async post(url, opt) { return this(url, opt, "POST"); }
    async put(url, opt) { return this(url, opt, "PUT"); }
    async delete(url, opt) { return this(url, opt, "DELETE"); }
    async patch(url, opt) { return this(url, opt, "PATCH"); }
    async head(url, opt) { return this(url, opt, "HEAD"); }
    async options(url, opt) { return this(url, opt, "OPTIONS"); }
}