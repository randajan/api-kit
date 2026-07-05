import { FetchError } from "../arc/class/FetchError";
import { Fetch } from "./class/Fetch";

export const createFetch = Fetch.create;
export default createFetch;

export {
    Fetch,
    FetchError
}
