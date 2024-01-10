declare const _default: "\nfrom pyodide.http import pyfetch\n\nasync def get(url):\n    response = await pyfetch(url)\n    response.status_code = response.status\n    return response\n\n";
export default _default;
