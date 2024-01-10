import { GeneratedTest } from "./generateTest";
import { Config } from "./config";
export declare type AsyncifyENV = "native" | "browser" | "tests";
/**
 * @param {string} raw
 * @param {Config} config
 * @param {GeneratedTest | undefined} testData
 *
 * @throws {Error} if user code contains INTERNAL_FUNC_NAME_USER_CODE
 */
export declare const asyncify: (raw: string, config?: Partial<Config> | undefined, testData?: GeneratedTest | undefined) => string;
