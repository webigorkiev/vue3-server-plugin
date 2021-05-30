import type * as webpack from "webpack";

const isJS = (file: string): boolean => /\.js(\?[^.]+)?$/.test(file);
const isMap = (file: string): boolean => /\.js\.map$/.test(file);

export default class VueSSRServerPlugin {
    options: Record<string, any>;

    constructor (options = {}) {
        this.options = Object.assign({
            filename: 'vue-ssr-server-bundle.json'
        }, options)
    }

    apply(compiler: webpack.Compiler) {

        if(compiler.options.target !== 'node') {
            console.error('webpack config `target` should be "node".')
        }

        if(
            compiler.options.output
            && compiler.options.output.library
            && compiler.options.output.library.type !== 'commonjs2'
        ) {
            console.error('webpack config `output.libraryTarget` should be "commonjs2".')
        }

        if(!compiler.options.externals) {
            console.log(
                'It is recommended to externalize dependencies in the server build for ' +
                'better build performance.'
            )
        }

        compiler.hooks.compilation.tap('vue-server-plugin', (compilation: webpack.Compilation) => {
            compilation.hooks.afterProcessAssets.tap('HelloCompilationPlugin', (ass) => {
                const stats = compilation.getStats().toJson()

                if(!stats.entrypoints || !stats.assets) {

                    return;
                }

                const entryName = Object.keys(stats.entrypoints)[0];
                const entryInfo = stats.entrypoints[entryName];

                if (!entryInfo|| !entryInfo.assets) {

                    return;
                }

                const entryAssets = entryInfo.assets.filter(file => {
                    return isJS(file.name) && !file.name.endsWith('hot-update.js');
                })

                if (entryAssets.length > 1) {
                    throw new Error(
                        `Server-side bundle should have one single entry file. ` +
                        `Avoid using CommonsChunkPlugin in the server config.`
                    )
                }

                const entry = entryAssets[0]

                if (!entry || typeof entry.name !== 'string') {
                    throw new Error(
                        `Entry "${entryName}" not found. Did you specify the correct entry option?`
                    )
                }

                const bundle = {
                    entry: entry.name,
                    files: {} as Record<string, any>,
                    maps: {} as Record<string, any>
                }

                compilation.getAssets().map(asset => {
                    const source = asset.source.source();

                    if(isJS(asset.name)) {
                        bundle.files[asset.name] = source;
                    } else if(isMap(asset.name)) {
                        bundle.maps[asset.name.replace(/\.map$/, '')] = JSON.parse(Buffer.from(source).toString());
                    }

                    compilation.deleteAsset(asset.name);

                });

                const json = JSON.stringify(bundle, null, 4);
                const filename = this.options.filename;

                compilation.assets[filename] = {
                    source: () => json,
                    size: () => json.length,
                    map: () => ({}),
                    sourceAndMap: () => ({source: json, map: {}}),
                    updateHash: () => {},
                    buffer: () => Buffer.from(json)
                }
            });
        });
    }
};

module.exports = VueSSRServerPlugin;