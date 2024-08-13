// 通常の関数
function getHello(name: string): string {
    return "hello " + name + " !"
}

let getHello3 = function getHello2(name: string): string {
    return "hello " + name + " !";
}

// 無名関数
let getHello4 = (name: string) : string =>  {
    return "hello " + name + " !";
}

// アロー関数(ラムダ式)
let getHello5 = (name: string) : string =>  "hello " + name + " !"


// 引数なしのアロー関数
let getHello6 = () =>  "hello F !"


console.log(getHello("A"));
console.log(getHello3("B"));
console.log(getHello3("C"));
console.log(getHello4("D"));
console.log(getHello5("E"));
console.log(getHello6());