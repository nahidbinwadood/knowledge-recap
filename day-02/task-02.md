# Tasks

Please complete the following tasks and post them on the tapaScript Discord under "40 Days of JavaScript".

> **DO NOT USE AI to FIND ANSWERS**. If you are stuck, let's discuss it on DISCORD and learn. Also, please note that none of the answers need you to create any UI. Just focus on the logic building and print the output on the browser console.

## 1. Explain Temporal Dead Zone by creating 3 variables inside a block. Post the code as your answer.

```

console.log(address)

 var name= 'Nahid Bin Wadood'

    var age=26

    console.log(`{name} is ${age} years old`)

    let address='mirpur'

    console.log(`${name} lives in ${address}`)



```

here in the creation phase of the code, the variables will be allocated in the memory with initialized for var variables and uninitialized. so if we try to access the value of address from the starting of the block till the address variable is declared then we will reference error and these are the temporal dead zone where we cannot access the variable only for let and const.

## 2. Explain Variable and Function Hoisting with Example. Post the code as your answer.

```
printName()

let name= 'nahid bin wadood'

const age=26

var address='mirpur'

function printName(){
    console.log(`hello`)
}

```

here in the creation phase, the variable name and age will be allocated on memory with uninitialized and address will be initialized then the function printName definition will be stored in the memory.

so in the execution phase, when the function printName has invoked then in from the memory it has access the printName function so it executes with its function execution context and don't get the error even if we have invoked the function before the declaration but we don't get error for the creation phase memory allocation.
 