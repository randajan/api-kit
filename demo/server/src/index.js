import { info } from '@randajan/simple-lib/node';
import express from 'express';
import createApi, { ApiError } from "../../../dist/esm/server/index";
import cors from "cors";

const app = express();
const PORT = info.port+1;

const api = createApi({ });


app.use(express.json());

app.use(cors());

app.get('/api', async (req, res) => {
    const body = api.code(3, _=>{
        return "really good";
    }, {timestamp:true});

    res.send(body);
});

app.get('/error', async (req, res) => {
    const body = api(_=>{
        throw new Error("Unknown error");
    }, {timestamp:true});

    res.send(body);
});

app.get('/timeout', async (req, res) => {
    console.log("f");
});

app.get("/fake", (req, res)=>{
    res.send({error:"fuck"});
});

app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
