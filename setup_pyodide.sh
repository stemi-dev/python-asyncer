#!/bin/sh

PYODIDE_FOLDER="pyodide"

if [ -d $PYODIDE_FOLDER ]; then
    echo "Exists"
    exit
fi

mkdir $PYODIDE_FOLDER
cd $PYODIDE_FOLDER || exit

wget https://github.com/pyodide/pyodide/releases/download/0.18.1/pyodide-build-0.18.1.tar.bz2
tar -xf pyodide-build-0.18.1.tar.bz2

mv pyodide/* .
rm pyodide-build-0.18.1.tar.bz2
