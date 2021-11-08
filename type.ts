export type Pyodide = {
  runPythonAsync: <T = any>(code: string) => Promise<T>;
};
