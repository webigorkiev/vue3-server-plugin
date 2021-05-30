import type * as webpack from "webpack";
export default class VueSSRServerPlugin {
    options: Record<string, any>;
    constructor(options?: {});
    apply(compiler: webpack.Compiler): void;
}
