import { AsyncifyENV } from "./asyncify";
export declare type Config = {
    env: AsyncifyENV;
    indents: number;
    maxIterations: number;
    stdioInput: string;
    stdioOutput: string;
};
export declare const defaultConfig: Config;
