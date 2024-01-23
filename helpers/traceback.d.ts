import { Config } from "../config";
export declare const getLineMapping: (asyncifiedCode: string) => {
    [k: string]: number;
};
export declare const mapTraceback: (traceback: string, asyncifiedCode: string) => string;
export declare const tracebackFormatter: (traceback: string, asyncifiedCode: string, stdio: Pick<Config, "stdioInput" | "stdioOutput">) => string;
