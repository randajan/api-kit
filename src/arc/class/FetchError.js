import { safe } from "@randajan/props";
import { mrgStr } from "../tool";


export class FetchError extends Error {

    static is(any) { return any && any instanceof FetchError; }

    static code(code, message, opt={}) {
        opt.code = code;
        return new FetchError(message, opt);
    }

    constructor(message, options={}) {
        const { code, ...opt } = (options || {});
        super(message, opt);

        safe(this, {}, "code", (t, f)=>mrgStr(t, f, "."));

        this.rise(code);
    }

    rise(code) {
        if (code == null) { return this; }
        this.code = code;
        return this;
    }

    toJSON() {
        const { message, cause } = this;
        const body = { message, ...this };
        if (cause) {
            const { message, stack } = cause;
            body.cause = { message, stack };
         }
        return body;
    }

    toString() {
        const { message, code } = this;
        return message + (code == null ? "" : ` (${code})`);
    }

}
