# Tasks

> **DO NOT USE AI to FIND ANSWERS**. If you are stuck, let's discuss it on DISCORD and learn. Also, please note that none of the answers need you to create any UI. Just focus on the logic building and print the output on the browser console.

## 1. Draw the Execution Context Diagram of the following code and share as explained below:

```js
const message = "I can do it";

function sum(a, b) {
    const result = a + b;
    return result;
}

function mul(a, b) {
    const result = a * b;
    return result;
}
function calc(a, b) {
    return (sum(a, b) + mul(a,b))/2;
}

function getResult(a, b) {
    return calc(a, b);
}

getResult(8, 5);
```

- Create the GEC and FEC with CP and EP flow
- Create the Stack and Heap Flow
- Create the Stack Diagram
- Create a Readme file with all the above diagram and share on Discord.


GEC:
    CP:
        -message variable will create with uninitialized.
        -sum,mul,calc,getResult function body will be allocated in the memory.

    EP: 
        -the message variable value which was uninitialized that will initialized with the value of "I can do it"
        - getResult() functions FEC will created.
            FEC(getResult):
                CP: the variable a and b will be uninitialized.
                EP: the value a and b will be replaced then.it will create another function execution context of calc and pass the value 8 and 5 as parameter.
                    FEC(calc):
                        CP:the variable a and b will be uninitialized.
                        EP: the sum function execution will start.
                            FEC(sum):
                                CP: the variable result will be uninitialized.
                                EP: the value a and b will be initialized of the result variable then it return the value.
                            after the sum functions execution it returns 13 then the mul function execution context will start.
                            FEC(mul):
                                CP: the variable result will be uninitialized.
                                EP: the value a and b will be initialized of the result variable then it return the value

                            now the 13+40 and then/2 the value will be return as 25.5.

                        now the return value from calc function will return and it will end
                         
                        


stack diagram-->

 1. GEC.
 2. getResult(FEC)
    1. GEC
 3. calc(FEC)
    1. getResult(FEC)
    2. GEC
 4. sum(FEC)
    1. calc(FEC)
    2. getResult(FEC)
    3. GEC
5. calc(FEC)
    1. getResult(FEC)
    2. GEC
 6. mul(FEC)
    1. calc(FEC)
    2. getResult(FEC)
    3. GEC
 7. calc(FEC)
    1. getResult(FEC)
    2. GEC
 8. getResult(FEC)
    1. GEC
 9. GEC
 10. clear
  