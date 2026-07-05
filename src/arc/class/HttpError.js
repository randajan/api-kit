import { safe } from "@randajan/props";
import { FetchError } from "./FetchError";



export class HttpError extends FetchError {

    static is(any) { return any && any instanceof HttpError; }

    static code(code, message, httpStatusCode=400, opt={}) {
        opt.code = code;
        return new HttpError(message, httpStatusCode, opt);
    }

    constructor(message, httpStatusCode=400, options={}) {
        const { detail, exposeCause, ...opt } = (options || {});
        const http = httpStatusCode ?? 400;

        const msg = message || `HTTP:${http}`;

        super(msg, opt);

        safe(this, {}, "_exposeCause", t=>!!t, undefined, false);

        this.detail = detail;
        this.httpStatusCode = http;
        this._exposeCause = exposeCause;
    }

    exposeCause(exposeCause=true) {
        this._exposeCause = exposeCause;
        return this;
    }

    toJSON() {
        const { message, cause, _exposeCause } = this;
        const body = {message, ...this};
        if (_exposeCause && cause) {

            const { message, stack } = cause;
            body.cause = { message, stack, ...cause };
         }
        return body;
    }

    toString() {
        const { httpStatusCode } = this;
        return super.toString() + ` [${httpStatusCode}]`;
    }

}
