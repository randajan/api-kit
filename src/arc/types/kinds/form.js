

export const mime = 'application/x-www-form-urlencoded';
export const decode = body=>Object.fromEntries(new URLSearchParams(body));
export const encode = body=>new URLSearchParams(body);

