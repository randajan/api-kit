# @randajan/api-kit

[![NPM](https://img.shields.io/npm/v/@randajan/api-kit.svg)](https://www.npmjs.com/package/@randajan/api-kit) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

JavaScript library for rendering structured data in HTML format. It supports automatic detection of tabular structures and visualization of deeply nested objects. It is ideal for debugging, admin interfaces, or displaying API responses.

## Installation


## Usage

### Server
You can use the library as an ES module:

```javascript
import createApi from "@randajan/api-kit/server";

const apiReponder = ({
    code:0,
    isAsync:false,
    timestamp:false,
    trait:(opt)=>opt,
    onOk:(resp, opt)=>{},
    onError:(resp, opt)=>{ },
    throwError:false
});


```

### Client
You can use the library as an ES module:

```javascript
import createFetch from "@randajan/api-kit/client";

const apiFetch = createFetch({
    code:0,
    url:"",
    fetch:globalThis.fetch,
    query:{},
    parseHeaders:false,             //if true it will parse response headers
    resultOnly:false,               //if true it will return only result
    timestamp:false,                //if true it will calculate timestamps
    parseBody:(body)=>body,         //custom parser for non api-kit server fetches only
    trait:(opt)=>opt,
    onOk:(resp, opt)=>{},
    onError:(resp, opt)=>{ },
    requestType:"json",             // json or form, the 'type' property is fallback
    responseType:"json",            // json or form, the 'type' property is fallback
    throwError:false
});


```

### Response contract

Unless `resultOnly` or `throwError` changes the flow, client calls return a response object with these flags:

```javascript
{
    isOk:true,        //true when response has no error
    isRemote:true,    //true when fetch received an HTTP response object
    isApiKit:true,    //true when response contains the api-kit marker
    statusCode:200,
    result:{},
    error:null
}
```

Common combinations:

```text
isOk  isRemote  isApiKit
true  true      true      successful api-kit response
false true      true      api-kit error response
false true      false     foreign API or HTTP error response
false false     false     local transport error, timeout or abort
```



## Support

If you have any questions or suggestions for improvements, feel free to open an issue in the repository.


## License

MIT © [randajan](https://github.com/randajan)
