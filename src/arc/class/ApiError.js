import { safe, solid } from "@randajan/props";
import { mrgStr, toStr } from "../tool";



export class ApiError extends Error {

    static create(code, message) { return new ApiError(code, message); }
    static to(any) {
        if (any instanceof ApiError) { return any; }
       
        const msg = toStr(any?.message || any) || "Unknown";
        const apierr = ApiError.create(0, code);
        return solid(apierr, "stack", any.stack, false);
    }

    constructor(code, message) {
        super(message);

        safe(this, {}, "code", (t, f)=>mrgStr(t, f));

        this.rise(code);
    }

    rise(code=0) {
        this.code = (code || 0);
        return this;
    }

    toJSON() {
        const { message } = this;
        return {message, ...this};
    }

}