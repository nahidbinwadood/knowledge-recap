# Tasks

## 1. What will be the output and why?

```js
const user = { name: 'Alex', age: undefined };
console.log(user.age ?? 'Not provided');
```

## 2. What will happen if we try to modify a frozen object?

```js
const obj = Object.freeze({ a: 1 });
obj.a = 2;
console.log(obj.a);
```

## 3. Given an object with deeply nested properties, extract name, company, and address.city using destructuring

```js
const person = {
  name: 'Tapas',
  company: {
    name: 'tapaScript',
    location: {
      city: 'Bangalore',
      zip: '94107',
    },
  },
};
```

## 4. Build a Student Management System

- Store student details in an object (name, age, grades).
- Implement a method to calculate the average grade.

## 5. Book Store Inventory System

- Store books in an object.
- Add functionality to check availability and restock books.

## 6. What is the difference between Object.keys() and Object.entries()? Explain with examples

Object.keys() returns an array of keys only and Object.entries() returns an array with keys and properties inside an array.

const person={
name:'John',
age:20
}

Object.keys(person) // ['name','age']
Object.entries(person) // [['name','John'],['name',20]]

## 7. How do you check if an object has a certain property?

Using "in" properties.
const person={
name:'John',
age:20
}

console.log("name" is person) //true

## 8. What will be the output and why?

```js
const person = { name: 'John' };
const newPerson = person;
newPerson.name = 'Doe';
console.log(person.name);
```

the output will be doe as the newPerson and person variables are referencing the same object so by changing any properties of that object from using newPerson variable will change the actual value the object so as both variables are referencing the same object so person.name will be john

## 9. What’s the best way to deeply copy a nested object? Explain with examples

use structuredClone method.

## 10. Loop and print values using Object destructuring

```js
const users = [
  {
    name: 'Alex',
    address: '15th Park Avenue',
    age: 43,
  },
  {
    name: 'Bob',
    address: 'Canada',
    age: 53,
  },
  {
    name: 'Carl',
    address: 'Bangalore',
    age: 26,
  },
];
```

users.map(({name,address,age})={
  console.log(`${name} is from ${address} and he is ${age} years old`)
})
