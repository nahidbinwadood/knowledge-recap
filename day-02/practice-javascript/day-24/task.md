# Tasks

## 1. Create a function wait(ms) that returns a promise which resolves after ms milliseconds. Use async/await to log messages before and after the delay

```js
function wait(ms) {
  console.log('Started');
  setTimeout(() => {
    console.log('resolved');
  }, ms);
}

await wait(2000);
```

## 2. Using async/await, log "One", then after 1 second log "Two", then "Three" after another 2 seconds. No setTimeout outside of promises

```js
async function delay() {
  console.log('One');
  setTimeout(() => {
    console.log('Two');
  }, 1000);
  setTimeout(() => {
    console.log('Three');
  }, 5000);
}

await delay();
```

## 3. Use fetch() with async/await to load a local JSON file (data.json) and display its contents in the console

```js
async function fetchData() {
  const response = await fetch('localhost:3000/posts');
  const result = await response.json();
  console.log(result);
}

await fetchData();
```

## 4. Use the public API `https://jsonplaceholder.typicode.com/users/1` to fetch and display the user’s name, email, and address on the page

```js
async function getUserData() {
  try {
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const result = await response.json();

    return {
      name: result?.name,
      email: result?.email,
      address: result?.address,
    };
  } catch (error) {
    console.error(error.message);
  }
}
```

## 5. Modify the previous task to handle errors (e.g., wrong URL) and display a user-friendly error message in the DOM

## 6. Refactor then/catch to async/await

```js
fetch('/api/data')
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));

async function getData() {
  try {
    const response = await fetch('/api/data');
    const result = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

## Project Task

Let's Build a “Movie Explorer” App

Build an app that lets users search movies using the OMDB API:
`http://www.omdbapi.com/?apikey=yourkey&s=movieName`

Hints:

- Input box for search term
- Display movie title, poster, and year
- Show “No results found” if search fails
- Use async/await, DOM manipulation, and try/catch
