import { safe, solid } from "@randajan/props";
import { mrgStr, toStr } from "../tool";



export class ApiError extends Error {

    static create(code, message, httpStatusCode=400, remoteStack=undefined) {
        return new ApiError(code, message, httpStatusCode, remoteStack);
    }

    static is(any) { return any instanceof ApiError; }

    static to(code, any, httpStatusCode=500) {
        if (ApiError.is(any)) { return any; }
       
        const msg = toStr(any?.message || any) || "Unknown";
        const apierr = ApiError.create(code, msg, httpStatusCode);
        return solid(apierr, "stack", any?.stack);
    }

    constructor(code, message, httpStatusCode=400, remoteStack=undefined) {
        super(message);

        safe(this, {}, "code", (t, f)=>mrgStr(t, f, "."));
        solid(this, "httpStatusCode", httpStatusCode ?? 400, true);
        solid(this, "remoteStack", remoteStack);

        this.rise(code);
    }

    rise(code=0) {
        this.code = (code || 0);
        return this;
    }

    exposeStack(exposeStack=true) {
        solid(this, "_exposeStack", !!exposeStack, false, true);
        return this;
    }

    toJSON() {
        const { message, stack, _exposeStack } = this;
        const body = {message, ...this};
        if (_exposeStack) { body.stack = stack; }
        else { delete body.stack; }
        return body;
    }

    toString() {
        const { message, code } = this;
        return message + (code == null ? "" : ` (${code})`);
    }

}
