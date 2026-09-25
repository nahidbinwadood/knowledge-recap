1.
var name="Nahid"

function callMe(){
    console.log(name)
}

in Global Execution Context(GEC), window object and this keyword has created and this value has pointed as the same reference as the window object. so that we can get the same value of the window by calling this.


here, in Creation phase-> first the window object and this will be created, then the variable-> name and function -> CallMe(the declaration) will be allocated at the memory and the variable will be initialized as undefined as this has been declared as var. 

in the execution phase, the name variable value will be assigned as "Nahid" and the function wont execute as we did not invoke the function.

2.

```
var name="Nahid"

function callMe(){
    console.log(name)
}

callMe()
```

here, in the starting, a global execution context(an environment where all the codes are available) will be created with two phases.In creation phase-->it creates window object and this keyword then the variable name and function body will be allocated in the memory but the variable is initialized as undefined .

in the execution phase,the actual value of the variable will be assigned then the callMe function will be executed.and here a function execution context will be created. when a function will be execute then an environment needed to execute that function so that environment is called the context and as this is about the function so that environment is calling the function execution context.

in FEC, is also has two phases.the creation phase and the execution phase.in the creation phase, actually nothing will be done as there is no value is assigned so it will move to the execution phase. so there a log function from the console object has been invoked, so there again another function execution context will be there and inside it in creation phase the variables and functions will be stored in memory then in the execution phase,whole will be replaced by the actual value and the functions will be executed.

3.

```
console.log("Inside Global Execution Context");
var a = 5;
function testMe() {
    console.log("Inside testMe Execution context");
    var b = 10;
    var user = {
        name: "tapas",
        country: "India"
    }
    function testAgain() {
        console.log("Inside testAgain Execution Context");
        console.log("Exiting testAgain Execution Context");
    }
    testAgain();
    console.log("Exiting testMe execution context");
}
testMe();
console.log("Exiting global execution context");
```
Every time a javascript code/the scripts loads in the browser or in node js environment then always a context is created. this is the environment and the states for the compiler to execute the codes. even there is no codes in that script ,still a context will be created and along with two things will be created . one is the global object ,if we run the script in the browser it will called the window object (the global object) along with all the accessible features of the browsers are stored in that object and for the global object of the nodejs environment with all the accessible features of the os system and other features. then a "this" variable is created and the value assigned of the reference of window/global object. if we access this in globally then "this" is the reference of the window/global object.

then the global creation phase and global execution phase will be started. in the global creation phase, all the variables and the functions are declared will be stored in the memory and in the global execution phase, the code will start executes from top to bottom. like the variable values are assigned with the actual value. such as if the variable let a=2. then in cp, a variable will be created in the memory and the 2 will be bind with the a variable in execution phase. the let a=5 is just an assignment of a value of 5 in a variable. the variable assignment is happening in the execution phase and the variable declaration process is done in the creation phase. and in the execution phase,the functions are executed which functions are invoked with the function execution phase.

Here, for the first time a global execution context will create to run the javascript code.then it will have two phases, basically all type of execution context will have two types of phases.one is the "Creation Phase" and another one is "Execution Phase". Creation phase allocate the variable name/binding and the function will store in that phase only. function store means function body only inside the the function scope will be stored like {...} just this way. the inner items or the lines are still not stored in the creation phase.


============
 