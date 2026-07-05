import { HttpError } from "../arc/class/HttpError";
import { Api } from "./class/Api";

export const createApi = Api.create;
export default createApi;
export {
    Api,
    HttpError
}