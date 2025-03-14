

export const mrgObj = (a, b, def)=>{
    if (!a && !b) { return def; }
    if (!a) { return {...b}; }
    if (!b) { return {...a}; }
    return {...a, ...b};
}

export const mrgOpt = (a, b)=>{
    const opt = mrgObj(a, b);

    opt.body = mrgObj(a?.body, b?.body);
    opt.params = mrgObj(a?.params, b?.params);
    opt.headers = mrgObj(a?.headers, b?.headers, {});

    return opt;
}

export const toStr = s=>s == null ? "" : String(s);
export const mrgStr = (a, b, sep="")=>{
    a = toStr(a); b = toStr(b);
    return (a && b) ? a+sep+b : a+b;
};

let _regexp = /^https?:\/\//i;
export const buildUrl = (inputUrl, params)=>{
    if (!params) { return inputUrl; }

    const hasHost = _regexp.test(inputUrl);
    const url = new URL(inputUrl, hasHost ? undefined : "http://thisisonlyplaceholder.com");
    url.hash = ""; // Odstranění hash parametrů

    for (const [key, value] of Object.entries(params)) {
        if (value != null) { url.searchParams.append(key, value); }
    };

    return hasHost ? url.toString() : url.pathname + url.search;
}