import slib, { argv } from "@randajan/simple-lib";


slib(argv.isBuild, {
    lib:{
        minify:false,
    }
})