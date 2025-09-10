import * as json from "./kinds/json";
import * as form from "./kinds/form";


const types = { json, form };
const getType = (typeName)=>{
    if (!typeName) { return json; }
    const type = types[typeName];
    if (type) { return type; }
    throw new Error(`Unknow config.type '${typeName}'. Must be one of: '${[...Object.keys(types)].join("', '")}'`);
}


export const encodeBody = (opt)=>{
    const type = getType(opt.requestType || opt.type); 
    
    opt.headers["Content-Type"] = type.mime;
    opt.body = type.encode(opt.body);
}

export const attachBodyDecoder = (opt)=>{
    const type = getType(opt.responseType || opt.type);

    opt.headers['Accept'] = type.mime;
    opt.decodeBody = type.decode;
}