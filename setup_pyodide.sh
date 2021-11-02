#!/bin/sh

if [ -d "./lib_pyodide" ]; then
    echo "Exists"
    exit
fi

wget https://github.com/pyodide/pyodide/releases/download/0.18.1/pyodide-build-0.18.1.tar.bz2

tar -xf pyodide-build-0.18.1.tar.bz2
mv pyodide lib_pyodide
rm pyodide-build-0.18.1.tar.bz2
