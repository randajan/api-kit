

export const mrgObj = (a, b, def)=>{
    if (!a && !b) { return def; }
    if (!a) { return {...b}; }
    if (!b) { return {...a}; }
    return {...a, ...b};
}

export const toStr = s=>s == null ? "" : String(s);
export const mrgStr = (a, b, sep="")=>{
    a = toStr(a); b = toStr(b);
    return (a && b) ? a+sep+b : a+b;
};

export const isFn = any=>typeof any === "function";
export const doFn = any=>isFn(any) ? any() : any;
export const isProm = any=>any instanceof Promise;
export const isErr = any=>any instanceof Error;
