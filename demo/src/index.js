
import { info, log } from "@randajan/simple-lib/web";
import { fetchJson } from "../../dist/index.js";



window.fetchApi = fetchJson({
    url:"https://itcan.cz"
});