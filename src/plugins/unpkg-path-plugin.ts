import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
  name: "filecache",
});

export const unpkgPathPlugin = (inputCode: string) => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      //handle root file of 'index.js'
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        build.onResolve({ filter: /(^index\.js$)/ }, () => {
          return { path: "index.js", namespace: "a" };
        });
        //Handle rellative path in module
        build.onResolve({ filter: /^\.+\// }, (args: any) => {
          return {
            namespace: "a",
            path: new URL(
              args.path,
              "https://unpkg.com" + args.resolveDir + "/"
            ).href,
          };
        });

        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`,
        };
      });

      //Handle main file of a module

      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        console.log("onLoad", args);

        if (args.path === "index.js") {
          return {
            loader: "jsx",
            contents: inputCode,
          };
        }

        //check to see if we have already fetched this file and if it is in the cache

        //and if it is in the cache

        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (cachedResult) {
          return cachedResult;
        }
        //if it is return immediately
        const { data, request } = await axios.get(args.path);
        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
