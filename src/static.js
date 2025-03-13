import { buildUrl } from "./tool";

export const staticFetchJson = async (_fetch, url, opt, method) => {

    if (method) { opt.method = method; }
    opt.headers['Accept'] = 'application/json';

    if (opt.body) {
        opt.headers["Content-Type"] = "application/json";
        opt.body = JSON.stringify(opt.body);
    }

    let resp, raw, result;

    if (opt.trait) { opt = opt.trait(opt); delete opt.trait; }

    try {
        resp = await _fetch(buildUrl(url, opt.params), opt);
        raw = await resp.text();
    } catch (e) {
        const error = e.message || "Network error";
        return Object.freeze({ ok: false, status: 0, statusText:error, result: { error } });
    }

    // Pokud server vrátil JSON, pokusíme se ho naparsovat
    if (raw && resp.headers.get("Content-Type")?.includes("application/json")) {
        try { result = JSON.parse(raw); }
        catch { result = { error: "Invalid JSON" }; }
    }

    let { ok, status, headers, statusText } = resp;

    if (!result) { result = { error: raw || statusText || "Unknown error" }; }
    if (result.error) { statusText = result.error; }


    headers = Object.freeze(Object.fromEntries(headers.entries()));
    return Object.freeze({ ok, status, headers, statusText, result });
};
