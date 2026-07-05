# @randajan/api-kit

[![NPM](https://img.shields.io/npm/v/@randajan/api-kit.svg)](https://www.npmjs.com/package/@randajan/api-kit) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

`@randajan/api-kit` wraps server handlers and client `fetch` calls into one predictable response and error contract. It keeps successful results, known HTTP errors, foreign API responses, decode failures, timeouts, and aborts distinguishable without forcing every call site to use `try/catch`.

## Installation

```sh
npm install @randajan/api-kit
```

## Imports

```js
import createApi, { HttpError } from "@randajan/api-kit/server";
import createFetch, { FetchError } from "@randajan/api-kit/client";
```

For shared packages or full-stack code:

```js
import { createApi, createFetch, HttpError, FetchError } from "@randajan/api-kit";
```

`HttpError` is exported by the server subpath and the root package. The client subpath exports `FetchError`.

## Quick Start

### Server

Do: wrap handler logic with `api(...)`, then send the returned body with `body.statusCode`.

```js
import express from "express";
import createApi, { HttpError } from "@randajan/api-kit/server";

const app = express();
const api = createApi({ timetrack:true });

app.get("/users/:id", (req, res) => {
    const body = api.code(10, () => {
        if (!req.params.id) {
            throw HttpError.code(1, "Missing user id", 400);
        }

        return { id:req.params.id, name:"Ada" };
    });

    res.status(body.statusCode).json(body);
});
```

Returns an api-kit response body containing a package marker, `statusCode`, and either `result` or `error`.

### Client

Do: create a configured fetch wrapper and read `isOk`, `result`, and `error`.

```js
import createFetch from "@randajan/api-kit/client";

const api = createFetch({
    url:"https://api.example.com/",
    timeout:10000
});

const body = await api.get("users/42");

if (body.isOk) {
    console.log(body.result);
} else {
    console.error(body.statusCode, body.error);
}
```

Returns a frozen response object unless `resultOnly:true` or `throwError:true` changes the flow.

## Response Contract

Client calls return this normalized shape:

```js
{
    "@randajan/api-kit":"3.0.0", // present only for api-kit server responses
    isOk:true,                  // true when there is no error
    isRemote:true,              // true when fetch received an HTTP Response
    isApiKit:true,              // true when the response had the api-kit marker
    apiKitDiff:undefined,       // "major", "minor", or "patch" when versions differ
    statusCode:200,
    result:{},
    error:undefined,
    headers:undefined,          // present when parseHeaders:true
    time:undefined              // present when timetrack:true
}
```

Common flag combinations:

| `isOk` | `isRemote` | `isApiKit` | Meaning |
| --- | --- | --- | --- |
| `true` | `true` | `true` | Successful api-kit response |
| `false` | `true` | `true` | Api-kit error response |
| `true` | `true` | `false` | Successful foreign API response |
| `false` | `true` | `false` | Foreign HTTP/API error or remote decode/read error |
| `false` | `false` | `false` | Local transport error, timeout, abort, or fetch failure |

Notes:

- `statusCode` is taken from `error.httpStatusCode` when the error has one, otherwise from the HTTP response.
- Empty successful responses such as `204`, `HEAD 200`, and `304` return `isOk:true` with `result:undefined`.
- Non-api-kit successful responses are returned as `result` after response decoding.

## Errors

### Known Server Errors

Use `HttpError.code(code, message, httpStatusCode, options)` for errors that should cross the API boundary with a known HTTP status.

```js
throw HttpError.code(20, "Email already exists", 409, {
    detail:{ field:"email" },
    cause:error
});
```

`detail` is public structured data. `cause` is hidden by default unless the server option `exposeCause:true` is enabled.

### Local Client Errors

Client transport failures are represented as `FetchError` instances:

```js
import createFetch, { FetchError } from "@randajan/api-kit/client";

const api = createFetch({
    normalizeError(error) {
        if (error.name === "QuotaExceededError") {
            return FetchError.code(90, "Client quota exceeded", { cause:error });
        }
    }
});
```

Return a `FetchError` from client `normalizeError`. Returning anything else falls back to an `Unknown` `FetchError`.

### Throwing Instead Of Returning

By default, api-kit returns response objects. Use `throwError:true` when you want errors to be thrown after normalization.

```js
const api = createFetch({ url:"https://api.example.com/", throwError:true });

try {
    const body = await api.get("users/42");
    console.log(body.result);
} catch (error) {
    console.error(error.code, error.message);
}
```

The same option exists on the server wrapper.

### Normalizing Known Errors

Use `normalizeError(error, opt)` to convert framework or application errors into api-kit errors before the default fallback runs.

```js
const api = createApi({
    normalizeError(error) {
        if (error.name === "ValidationError") {
            return HttpError.code(30, "Validation failed", 422, {
                detail:error.fields,
                cause:error
            });
        }
    }
});
```

Server `normalizeError` should return `HttpError`. Client `normalizeError` should return `FetchError`. If the hook throws or returns another value, api-kit falls back to `Unknown`.

### Exposing Cause

Use `exposeCause:true` only for trusted environments. It can expose server-side error messages and stacks in the serialized API response.

```js
const api = createApi({ exposeCause:process.env.NODE_ENV !== "production" });
```

## Options

Options can be passed to the constructor and overridden per call. Client options are shallow-merged, with `body`, `params`, and `headers` merged separately.

### Shared Options

| Option | Type | Description |
| --- | --- | --- |
| `timetrack` | `boolean` | Adds timing metadata. Server records handler time; client can calculate network timing from server time. |
| `trait` | `(opt) => opt` | Last chance to inspect or mutate options before execution. |
| `onOk` | `(body, opt) => void` | Called when normalized response has no `error`. |
| `onError` | `(body, opt) => void` | Called when normalized response has `error`. |
| `throwError` | `boolean` | Throws `body.error` instead of returning an error response. |
| `normalizeError` | `(error, opt) => Error` | Converts known errors before api-kit creates its default unknown error. |

### Server Options

| Option | Type | Description |
| --- | --- | --- |
| `code` | `string` or `number` | Prefix for server error codes. Also set by `api.code(code, exe, opt)`. |
| `isAsync` | `boolean` | Forces async handler execution. Promise results are also detected without this option. |
| `exposeCause` | `boolean` | Includes serialized `cause` in `HttpError.toJSON()`. |

### Client Options

| Option | Type | Description |
| --- | --- | --- |
| `fetch` | `Function` | Custom fetch implementation. Constructor-only; removed from stored config. |
| `url` | `string` | Base or prefix URL joined with the call URL. |
| `params` | `object` | Query params appended to the final URL. `null` and `undefined` values are skipped. |
| `method` | `string` | HTTP method. Set automatically by `.get()`, `.post()`, `.put()`, `.delete()`, `.patch()`, `.head()`, and `.options()`. |
| `body` | `object` or any | Request body before encoding. |
| `headers` | `object` | Request headers. api-kit also sets `Content-Type` and `Accept` from the selected type. |
| `requestType` | `string` | Encoder for request body. Native values: `json`, `form`. |
| `responseType` | `string` | Decoder for response body. Native values: `json`, `form`. |
| `type` | `string` | Fallback for both `requestType` and `responseType`. |
| `types` | `object` | Custom type definitions: `{ mime, encode, decode }`. |
| `timeout` | `number` | Timeout in milliseconds. Creates an abort signal when greater than `0`. |
| `isAbortable` | `boolean` | Adds `.abort()` to the returned promise. |
| `parseHeaders` | `boolean` | Adds frozen parsed response headers to `body.headers`. |
| `resultOnly` | `boolean` | Returns only `body.result` after normalization. |

### Runtime Fields

These fields are created or changed by api-kit during execution. Do not set them manually unless you are intentionally extending internals.

| Field | Created by | Description |
| --- | --- | --- |
| `startAt` | `start(opt)` | Timestamp used by `timetrack`. |
| `decodeBody` | `attachBodyDecoder()` | Response body decoder selected from `responseType` or `type`. |
| `abortController` | client prepare step | Controller used by timeout and abortable requests. |
| `signal` | client prepare step | Fetch abort signal. |
| `timeoutId` | client prepare step | Timer cleared after the request settles. |

The client also mutates prepared `url`, `method`, `headers`, and encoded `body`.

## Recipes

### POST JSON

Do:

```js
const body = await api.post("users", {
    body:{ name:"Ada" }
});
```

Returns an api-kit response object. JSON is the default request and response type.

### POST Form Data

Do:

```js
const body = await api.post("login", {
    requestType:"form",
    body:{ username:"ada", password:"secret" }
});
```

Notes: `requestType:"form"` uses `application/x-www-form-urlencoded`.

### Timeout And Abort

Do:

```js
const request = api.get("slow", {
    timeout:1000,
    isAbortable:true
});

request.abort();

const body = await request;
```

Returns a local transport error response with `isRemote:false` when the request is aborted before an HTTP response is received.

### Parse Response Headers

Do:

```js
const body = await api.get("users/42", {
    parseHeaders:true
});

console.log(body.headers);
```

Returns `body.headers` as a frozen plain object.

### Custom Content Type

Do:

```js
const api = createFetch({
    url:"https://api.example.com/",
    responseType:"text",
    types:{
        text:{
            mime:"text/plain",
            encode:value=>String(value),
            decode:text=>text
        }
    }
});

const body = await api.get("status");
```

Notes: Custom request types require `mime` and `encode`. Custom response types require `mime` and `decode`.

### Map A Known App Error

Do:

```js
class NotFoundError extends Error {}

const api = createApi({
    normalizeError(error) {
        if (error instanceof NotFoundError) {
            return HttpError.code(40, "Not found", 404, { cause:error });
        }
    }
});
```

Returns a regular api-kit error response with HTTP status `404`.

## Support

Open an issue in the repository for questions, bugs, or improvement ideas.

## License

MIT (c) [randajan](https://github.com/randajan)
