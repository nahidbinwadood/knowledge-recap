## The Scope Table

## Comparison Table: `var` vs `let` vs `const`

| Feature                     | `var`                                               | `let`                                       | `const`                                                                |
| --------------------------- | --------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| **Scope**                   | Function scope                                      | Block scope `{}`                            | Block scope `{}`                                                       |
| **Hoisting**                | Hoisted & initialized as `undefined`                | Hoisted but in **Temporal Dead Zone (TDZ)** | Hoisted but in **Temporal Dead Zone (TDZ)**                            |
| **Attached to `window`?**   | ✅ Yes                                              | ❌ No                                       | ❌ No                                                                  |
| **Can be Re-declared?**     | ✅ Yes                                              | ❌ No                                       | ❌ No                                                                  |
| **Can be Reassigned?**      | ✅ Yes                                              | ✅ Yes                                      | ❌ No                                                                  |
| **Initial Value Required?** | ❌ No                                               | ❌ No                                       | ✅ Yes (Must be initialized)                                           |
| **Mutability**              | Mutable                                             | Mutable                                     | Immutable (Can't be reassigned but mutable if it's an object or array) |
| **Use in Loops**            | Allowed but not recommended (function scope issues) | ✅ Recommended                              | ❌ Not recommended for changing values                                 |
