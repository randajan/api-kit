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
    const outcome = await api(3, _=>{
        throw new ApiError(1, "WHAT THE FUCK");
    });

    res.send(outcome);
    res.status = outcome.status;
});

app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
