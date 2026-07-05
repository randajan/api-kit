import { info } from "@randajan/simple-lib/web";
import createFetch from "../../../dist/esm/client/index.mjs";

const apiKey = info.name;
const root = document.getElementById("root");

const fetchApi = createFetch({
    url:`http://localhost:${info.port+1}/`,
    timeout:10000,
    trait:opt=>{
        //console.log("[api-kit demo request]", opt);
        return opt;
    }
});

window.fetchApi = fetchApi;

const assert = (condition, message)=>{
    if (!condition) { throw new Error(message); }
}

const assertApiKit = body=>{
    assert(body?.[apiKey], "Expected api-kit response marker");
    assert(body.isApiKit === true, "Expected api-kit response");
    assert(body.isRemote === true, "Expected remote api-kit response");
}

const assertErrorStatus = (body, statusCode)=>{
    assert(body.isOk === false, "Expected failed response");
    assert(body.statusCode === statusCode, `Expected statusCode ${statusCode}, got ${body.statusCode}`);
}

const assertEmptyResponse = (body, statusCode)=>{
    assert(!body?.[apiKey], "Expected non-api-kit response");
    assert(body.isApiKit === false, "Expected non-api-kit response");
    assert(body.isRemote === true, "Expected remote empty response");
    assert(body.isOk === true, "Expected ok empty response");
    assert(body.statusCode === statusCode, `Expected statusCode ${statusCode}, got ${body.statusCode}`);
    assert(body.result === undefined, `Expected undefined result, got ${body.result}`);
}

const tests = [
    {
        name:"JSON success",
        run:()=>fetchApi.post("api/json", { body:{ hello:"json" } }),
        expect:body=>{
            assertApiKit(body);
            assert(body.isOk === true, "Expected ok response");
            assert(body.statusCode === 200, `Expected statusCode 200, got ${body.statusCode}`);
            assert(body.result?.req?.hello === "json", "Expected echoed JSON body");
        }
    },
    {
        name:"Form success",
        run:()=>fetchApi.post("api/form", { requestType:"form", body:{ hello:"form" } }),
        expect:body=>{
            assertApiKit(body);
            assert(body.isOk === true, "Expected ok response");
            assert(body.statusCode === 200, `Expected statusCode 200, got ${body.statusCode}`);
            assert(body.result?.req?.hello === "form", "Expected echoed form body");
        }
    },
    {
        name:"API error over HTTP 200",
        run:()=>fetchApi.get("api/error/http-200"),
        expect:body=>{
            assertApiKit(body);
            assertErrorStatus(body, 409);
            assert(String(body.error?.code || "").includes("10"), "Expected preserved HttpError code");
        }
    },
    {
        name:"API error over HTTP status",
        run:()=>fetchApi.get("api/error/http-status"),
        expect:body=>{
            assertApiKit(body);
            assertErrorStatus(body, 409);
            assert(String(body.error?.code || "").includes("11"), "Expected preserved HttpError code");
        }
    },
    {
        name:"Unknown API error over HTTP status",
        run:()=>fetchApi.get("api/error/unknown-http-status"),
        expect:body=>{
            assertApiKit(body);
            assertErrorStatus(body, 500);
        }
    },
    {
        name:"Plain non-api HTTP error",
        run:()=>fetchApi.get("plain/error/http-status"),
        expect:body=>{
            assert(body.isRemote === true, "Expected remote HTTP rejection");
            assert(body.isApiKit === false, "Expected non-api-kit response");
            assertErrorStatus(body, 418);
        }
    },
    {
        name:"Unreadable HTTP 200",
        run:()=>fetchApi.get("plain/unreadable"),
        expect:body=>{
            assert(body.isRemote === true, "Expected remote unreadable rejection");
            assert(body.isApiKit === false, "Expected non-api-kit response");
            assertErrorStatus(body, 200);
        }
    },
    {
        name:"Unreadable HTTP status",
        run:()=>fetchApi.get("plain/unreadable-http-status"),
        expect:body=>{
            assert(body.isRemote === true, "Expected remote HTTP rejection");
            assert(body.isApiKit === false, "Expected non-api-kit response");
            assertErrorStatus(body, 502);
        }
    },
    {
        name:"Empty HTTP 204",
        run:()=>fetchApi.get("plain/empty"),
        expect:body=>assertEmptyResponse(body, 204)
    },
    {
        name:"Empty HEAD 200",
        run:()=>fetchApi.head("plain/empty-head"),
        expect:body=>assertEmptyResponse(body, 200)
    },
    {
        name:"Empty HTTP 304",
        run:()=>fetchApi.get("plain/not-modified"),
        expect:body=>assertEmptyResponse(body, 304)
    },
    {
        name:"Invalid JSON",
        run:()=>fetchApi.get("plain/invalid-json"),
        expect:body=>{

        }
    },
    {
        name:"Timeout",
        run:()=>fetchApi.get("timeout", { timeout:500 }),
        expect:body=>{
            assert(body.isRemote === false, "Expected local timeout rejection");
            assertErrorStatus(body, undefined);
        }
    },
    {
        name:"Abort",
        run:()=>{
            const req = fetchApi("timeout", { isAbortable:true });
            req.abort();
            return req;
        },
        expect:body=>{
            assert(body.isRemote === false, "Expected local abort rejection");
            assertErrorStatus(body, undefined);
        }
    }
];

const results = tests.map(test=>({
    name:test.name,
    state:"waiting",
    body:null,
    error:null
}));

const statusText = {
    waiting:"Waiting",
    running:"Running",
    passed:"Passed",
    failed:"Failed"
};

const render = ()=>{
    const passed = results.filter(result=>result.state === "passed").length;
    const failed = results.filter(result=>result.state === "failed").length;
    const finished = passed + failed;

    root.innerHTML = `
        <main class="demo-shell">
            <section class="demo-header">
                <div>
                    <h1>${info.name}</h1>
                    <p>HTTP statusCode and HttpError behavior demo</p>
                </div>
                <button id="run-tests" type="button">Run again</button>
            </section>
            <section class="demo-summary">
                <span>${finished}/${tests.length} finished</span>
                <span>${passed} passed</span>
                <span>${failed} failed</span>
            </section>
            <ol class="demo-tests">
                ${results.map((result, index)=>`
                    <li class="demo-test demo-test-${result.state}">
                        <div class="demo-test-main">
                            <strong>${index+1}. ${result.name}</strong>
                            <span>${statusText[result.state]}</span>
                        </div>
                        ${result.error ? `<pre>${result.error}</pre>` : ""}
                        ${result.body ? `<pre>${JSON.stringify(result.body, null, 2)}</pre>` : ""}
                    </li>
                `).join("")}
            </ol>
        </main>
    `;

    document.getElementById("run-tests")?.addEventListener("click", runTests);
}

const runTests = async ()=>{
    for (const result of results) {
        result.state = "waiting";
        result.body = null;
        result.error = null;
    }

    render();

    for (const [index, test] of tests.entries()) {
        const result = results[index];
        result.state = "running";
        render();

        try {
            const body = await test.run();
            test.expect(body);
            result.state = "passed";
            result.body = body;
        } catch (err) {
            result.state = "failed";
            result.error = err?.stack || err?.message || String(err);
        }

        render();
    }
}

const style = document.createElement("style");
style.textContent = `
    * { box-sizing:border-box; }
    body {
        margin:0;
        background:#f5f7fb;
        color:#172033;
        font-family:Arial, sans-serif;
    }
    button {
        border:1px solid #172033;
        background:#172033;
        color:white;
        cursor:pointer;
        font:inherit;
        padding:10px 14px;
    }
    button:hover { background:#25324b; }
    .demo-shell {
        max-width:1100px;
        margin:0 auto;
        padding:32px 18px;
    }
    .demo-header,
    .demo-summary,
    .demo-test-main {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
    }
    .demo-header {
        border-bottom:1px solid #ccd3df;
        padding-bottom:18px;
    }
    .demo-header h1 {
        margin:0 0 4px;
        font-size:28px;
    }
    .demo-header p {
        margin:0;
        color:#4d5b70;
    }
    .demo-summary {
        margin:18px 0;
        justify-content:flex-start;
        color:#4d5b70;
    }
    .demo-tests {
        display:grid;
        gap:10px;
        list-style:none;
        margin:0;
        padding:0;
    }
    .demo-test {
        background:white;
        border:1px solid #d7deea;
        border-left-width:5px;
        border-radius:6px;
        padding:14px;
    }
    .demo-test-waiting { border-left-color:#9aa6b8; }
    .demo-test-running { border-left-color:#2f6fed; }
    .demo-test-passed { border-left-color:#1a8f5a; }
    .demo-test-failed { border-left-color:#c73535; }
    .demo-test-main span {
        color:#4d5b70;
        font-size:14px;
    }
    pre {
        max-height:220px;
        overflow:auto;
        margin:12px 0 0;
        background:#111827;
        color:#e9eef8;
        padding:12px;
        white-space:pre-wrap;
    }
    @media (max-width:640px) {
        .demo-header,
        .demo-summary,
        .demo-test-main {
            align-items:flex-start;
            flex-direction:column;
        }
        button { width:100%; }
    }
`;
document.head.append(style);

render();
runTests();
