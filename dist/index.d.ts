import type * as webpack from "webpack";
export default class {
    options: Record<string, any>;
    constructor(options?: {});
    apply(compiler: webpack.Compiler): void;
}
