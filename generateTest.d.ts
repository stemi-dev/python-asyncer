/// <reference types="faker" />
export declare type GeneratedTest = {
    input: string[];
    output: string[];
    outputComments: string[];
    defined: Record<string, string>;
};
declare type Test = {
    in: string;
} | {
    out: string;
    description?: string;
};
export declare type TemplateTests = {
    variables: Record<string, string>;
    defined: GeneratedTest["defined"];
    test: Test[];
};
export declare const generateTest: (json: TemplateTests, faker: Faker.FakerStatic, endWithKill?: boolean | undefined) => GeneratedTest;
export {};
