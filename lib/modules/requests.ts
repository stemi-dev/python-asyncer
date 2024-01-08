export default `
from pyodide.http import pyfetch

async def get(url):
    response = await pyfetch(url)
    return response

`