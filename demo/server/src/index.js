import { info } from '@randajan/simple-lib/node';
import express from 'express';
import createApi, { ApiError } from "../../../dist/server/index";
import cors from "cors";

const app = express();
const PORT = info.port+1;

const api = createApi({ isAsync:true });


app.use(express.json());

app.use(cors());

app.get('/api', async (req, res) => {
    const body = await api(3, _=>{
        return new ApiError(56, "WHAT THE FUCK");

    });

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
