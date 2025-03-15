import { ApiError } from "../arc/class/ApiError";
import { Fetch } from "./class/Fetch";

export const createFetch = Fetch.create;
export default createFetch;

export {
    Fetch,
    ApiError
}
