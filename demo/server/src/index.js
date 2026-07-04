import { info } from '@randajan/simple-lib/node';
import express from 'express';
import createApi, { ApiError } from "../../../dist/esm/server/index.mjs";
import cors from "cors";
import bodyParser from 'body-parser';

const app = express();
const PORT = info.port+1;

const api = createApi({ timestamp:true, code:0, exposeStack:true });

app.use(cors());

const sendApi = (res, body, statusCode=body.statusCode)=>res.status(statusCode).send(body);




app.post('/api/json', bodyParser.json(), async (req, res) => {

    const body = api.code(1, _=>{
        return { msg:"really good", req:req.body };
    }, {timestamp:true});

    sendApi(res, body);
});

app.post('/api/form', bodyParser.urlencoded({ extended:false }), async (req, res) => {

    const body = api.code(2, _=>{
        return { msg:"really good", req:req.body };
    }, {timestamp:true});

    sendApi(res, body);
});

app.get('/error', async (req, res) => {
    const body = api.code(3, _=>{
        throw new Error("Unknown error");
    }, {timestamp:true});

    res.send(body);
});

app.get('/api/error/http-200', async (req, res) => {
    const body = api.code(4, _=>{
        throw new ApiError(10, "Known conflict over HTTP 200", 409);
    });

    res.status(200).send(body);
});

app.get('/api/error/http-status', async (req, res) => {
    const body = api.code(5, _=>{
        throw new ApiError(11, "Known conflict over HTTP status", 409);
    });

    sendApi(res, body);
});

app.get('/api/error/unknown-http-status', async (req, res) => {
    const body = api.code(6, _=>{
        throw new Error("Unknown API failure over HTTP status");
    });

    sendApi(res, body);
});

app.get('/plain/error/http-status', async (req, res) => {
    res.status(418).send({ error:"Plain server error" });
});

app.get('/plain/unreadable', async (req, res) => {
    res.type("text/plain").send("not json");
});

app.get('/plain/unreadable-http-status', async (req, res) => {
    res.status(502).type("text/plain").send("bad gateway text");
});

app.get('/plain/empty', async (req, res) => {
    res.status(204).end();
});

app.head('/plain/empty-head', async (req, res) => {
    res.status(200).end();
});

app.get('/plain/not-modified', async (req, res) => {
    res.status(304).end();
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
