import * as json from "./kinds/json";
import * as form from "./kinds/form";
import { isFn } from "../tool";


const _types = { json, form };

const joinTypeNames = (types={})=>{
    const native = Object.keys(_types);
    const custom = typeof types === "object" ? Object.keys(types) : [];

    return `'${[...(new Set([...native, ...custom]))].join("', '")}'`;
}


const getType = (propertyName, reqFnName, opt)=>{
    const tn = (opt[propertyName] || opt.type);
    if (!tn) { return json; }

    const customType = opt.types?.[tn];
    const type = customType || _types[tn];

    if (!type) {
        throw new Error(`Unknown config.${propertyName} '${tn}'. Must be one of: ${joinTypeNames(opt.types)}`);
    }

    if (!customType) { return type; }

    if (!type.mime || typeof type.mime !== "string") {
        throw new Error(`Type definition '${tn}' requires 'mime' to be a string`);
    }

    if (!isFn(type[reqFnName])) { throw new Error(`Type definition '${tn}' requires '${reqFnName}' to be a function`); }

    return type;
}


export const encodeBody = (opt)=>{
    const type = getType("requestType", "encode", opt);

    opt.headers["Content-Type"] = type.mime;
    opt.body = type.encode(opt.body);
}

export const attachBodyDecoder = (opt)=>{
    const type = getType("responseType", "decode", opt);

    opt.headers['Accept'] = type.mime;
    opt.decodeBody = type.decode;
}
