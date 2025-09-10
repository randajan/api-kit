

export const mime = "application/json";
export const decode = body=>JSON.parse(body);
export const encode = body=>JSON.stringify(body);