let code = `foo
bar`

code = code.replace(/\\n/g, "\\\\n");
console.log(code)
