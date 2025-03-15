import { ApiError } from "../arc/class/ApiError";
import { Api } from "./class/Api";

export const createApi = Api.create;
export default createApi;
export {
    Api,
    ApiError
}