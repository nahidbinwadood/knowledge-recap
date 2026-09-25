## Hoisting==>

we already have heard the thing that is ,var ,let and const can hoist and sometimes we even heard that let and const are not hoisted so that we are getting error.so lets deep dive into it. This is a very simple thing to understand.

```

console.log(`before declaration, ${name}`)

var name='Nahid'

console.log(`after declaration, ${name}`)

```

here for the first time we will get the name as undefined and the second log we will get the actual value.now lets look another example for it->


```

console.log(`before declaration, ${name}`)

let name='Nahid'

console.log(`after declaration, ${name}`)

```

now in the console , we can see that,we've got an referenceError in the log. why is that? we will get the same error message for the const too.

here, we know that in the creation phase, js allocate memory for the variables and add bind for each variable so that in the execution phase it can assign/declare the values. so, for the var, its variable allocated in the memory with initialized so that in the first example, for the first time we got undefined. but in the 2nd example, the let variable also allocated in the memory but uninitialized. so that is why as the variable is allocated but its not initialized so that if we try to access the variable before the value declaration we will get an reference error. 

the temporal dead zone is basically the starting point of the code.like from the first line to the variable declaration line, this zone is called temporal dead zone.
