import slib, { argv } from "@randajan/simple-lib";

const { isBuild, isServer } = argv;

slib(isBuild, {
    mode: isServer ? "node" : "web",
    rebuildBuffer:isServer ? 500 : 100,
    lib:{
        minify:false,
        entries:["index.js", "client/index.js", "server/index.js"]
    },
    demo:{
        dir:isServer?"demo/server":"demo/client",
        external:isServer?["chalk"]:[],
    },
})