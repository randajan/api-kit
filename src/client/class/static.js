import { cached } from "@randajan/props";
import { buildUrl } from "../../arc/tool";

export const fetchExtra = async (_fetch, url, opt, method) => {

    if (method) { opt.method = method; }
    opt.headers['Accept'] = 'application/json';

    if (opt.body) {
        opt.headers["Content-Type"] = "application/json";
        opt.body = JSON.stringify(opt.body);
    }

    let resp, raw, json;

    if (opt.trait) { opt = opt.trait(opt); delete opt.trait; }

    try {
        resp = await _fetch(buildUrl(url, opt.params), opt);
        raw = await resp.text();
    } catch (e) {
        const error = e.message || "Network error"; //TODO
        console.error("❌ Fetch Error:", {
            name: e.name,
            message: e.message,
            type: e.constructor.name,
            stack: e.stack,
            cause: e.cause || "N/A",
            fullError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
        });
        return Object.freeze({ ok: false, headers:{}, error });
    }

    // Pokud server vrátil JSON, pokusíme se ho naparsovat
    if (raw && resp.headers.get("Content-Type")?.includes("application/json")) {
        try { json = JSON.parse(raw); }
        catch { json = { error: "Invalid JSON" }; } //TODO
    }

    const { status, headers, statusText } = resp;

    if (!json) { json = { error: raw || statusText || "Unknown error" }; }

    json.ok = !json.error;
    json.status = status;
    cached(json, {}, "headers", _=>Object.freeze(Object.fromEntries(headers.entries())));

    
    return Object.freeze(json);
};
