let _regexp = /^https?:\/\//i;
export const buildUrl = (inputUrl, params)=>{
    if (!params) { return inputUrl; }

    const hasHost = _regexp.test(inputUrl);
    const url = new URL(inputUrl, hasHost ? undefined : "http://thisisonlyplaceholder.xyz");
    url.hash = "";

    for (const [key, value] of Object.entries(params)) {
        if (value != null) { url.searchParams.append(key, value); }
    };

    return hasHost ? url.toString() : url.pathname + url.search;
}