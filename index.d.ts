declare module "pyodide/pyodide.js" {
  export = {
    loadPyodide({ indexURL: string }): Promise<Pyodide>;,
  };
}
