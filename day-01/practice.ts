/**
 * Day 1 — JavaScript/TypeScript arrays and objects
 *
 * Work through one function at a time. First write a short plan in a comment,
 * then implement it, then run `npm run day:01` to inspect the result.
 */

type Role = 'admin' | 'editor' | 'viewer';
type Status = 'active' | 'inactive';

type User = {
  id: number;
  name: string;
  age: number;
  role: Role;
  status: Status;
};

type Product = {
  id: number;
  name: string;
  price: number;
};

type CartItem = Product & {
  quantity: number;
};

const users: User[] = [
  { id: 1, name: 'Amina', age: 26, role: 'admin', status: 'active' },
  { id: 2, name: 'Rafi', age: 31, role: 'editor', status: 'inactive' },
  { id: 3, name: 'Nila', age: 44, role: 'viewer', status: 'active' },
  { id: 4, name: 'Siam', age: 38, role: 'editor', status: 'active' },
];

const products: Product[] = [
  { id: 1, name: 'Keyboard', price: 45 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Monitor', price: 210 },
];

const cart: CartItem[] = [
  { id: 1, name: 'Keyboard', price: 45, quantity: 2 },
  { id: 2, name: 'Mouse', price: 25, quantity: 4 },
];

export function getActiveUsers(allUsers: User[]): User[] {
  return allUsers.filter((user: User) => user.status === 'active');
}

export function getAverageAge(allUsers: User[]): number {
  if (!allUsers.length) {
    return 0;
  }
  return allUsers.reduce((acc, item) => acc + item.age, 0) / allUsers.length;
}

export function getOldestUser(allUsers: User[]): User | undefined {
  return allUsers.reduce(
    (max, user) => (max.age > user.age ? max : user),
    allUsers[0]
  );
}

export function getUserNames(allUsers: User[]): string[] {
  return allUsers.map((user: User) => user.name);
}

export function groupUsersByRole(allUsers: User[]): Record<Role, User[]> {
  return allUsers.reduce<Record<Role, User[]>>(
    (group, user) => {
      if (user.role) {
        group[user.role].push(user);
      }
      return group;
    },
    { admin: [], editor: [], viewer: [] }
  );
}

export function countUsersByStatus(allUsers: User[]): Record<string, number> {
  return allUsers.reduce<Record<string, number>>((acc, user) => {
    if (user.status) {
      acc[user.status] = (acc[user.status] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export function removeDuplicates<T>(values: T[]): T[] {
  return values.filter((item, idx) => values.indexOf(item) === idx);
}

export function sortProductsByPrice(allProducts: Product[]): Product[] {
  // asc
  return [...allProducts].sort((a, b) => a.price - b.price);

  // dsc
  // return allProducts.sort((a, b) => b.price - a.price);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

// ─── Production-Relevant Tasks ───────────────────────────────────────────────

// 1. Search users by partial name (case-insensitive)
export function searchUsers(allUsers: User[], query: string): User[] {
  // TODO: implement
  return allUsers.filter((user) => user.name.includes(query));
}

// 2. Sort users by age (asc or desc)
export function sortUsersByAge(allUsers: User[], asc: boolean = true): User[] {
  // TODO: implement
  return asc
    ? allUsers.sort((a, b) => b.age - a.age)
    : allUsers.sort((a, b) => a.age - b.age);
}

// 3. Get users with inactive status
export function getInactiveUsers(allUsers: User[]): User[] {
  // TODO: implement
  return allUsers?.filter((user) => user.status === 'inactive');
}

// 4. Find user by email
export function findUserByEmail(
  allUsers: User[],
  email: string
): User | undefined {
  // TODO: implement
  return allUsers.find((user) =>
    email.toLocaleLowerCase().includes(user.name.toLocaleLowerCase())
  );
}

// 5. Check if any user is admin
export function hasAdmin(allUsers: User[]): boolean {
  // TODO: implement
  return allUsers.some((user) => user.role === 'admin');
}

// 6. Extract all user emails
export function getUserEmails(allUsers: User[]): string[] {
  // TODO: implement
  return allUsers.map((user) => user.name.toLocaleLowerCase() + '@gmail.com');
}

// 7. Get distinct roles from users
export function getUniqueRoles(allUsers: User[]): Role[] {
  // TODO: implement
  return allUsers.reduce((role: Role[], user) => {
    if (user.role) {
      if (!role.includes(user.role)) {
        role.push(user.role);
      }
    }
    return role;
  }, []);
}

// 8. Find user with minimum age
export function getYoungestUser(allUsers: User[]): User | undefined {
  // TODO: implement
  return allUsers.reduce((min, user) => {
    return min.age > user?.age ? user : min;
  }, allUsers[0]);
}

// 9. Check if specific user is active
export function isUserActive(allUsers: User[], userId: number): boolean {
  // TODO: implement
  return allUsers.find((user) => user.id === userId)?.status === 'active';
}

// 10. Count number of admin users
export function countAdmins(allUsers: User[]): number {
  // TODO: implement
  return allUsers.filter((user) => user.role === 'admin').length;
}

// 11. Get users who are active AND editors
export function getActiveEditors(allUsers: User[]): User[] {
  // TODO: implement
  return allUsers.filter(
    (user) => user.role === 'editor' && user.status == 'active'
  );
}

// 12. Find user by ID
export function getUserById(allUsers: User[], id: number): User | undefined {
  // TODO: implement
  return allUsers.find((user) => user.id === id);
}

// 13. Filter products within price range
export function getProductsInPriceRange(
  allProducts: Product[],
  min: number,
  max: number
): Product[] {
  // TODO: implement
  return [];
}

// 14. Sum all cart item quantities
export function getTotalCartQuantity(items: CartItem[]): number {
  // TODO: implement
  return 0;
}

// 15. Cart items with name + subtotal
export function getCartSummary(
  items: CartItem[]
): { name: string; subtotal: number }[] {
  // TODO: implement
  return [];
}

// ─── Console Tests ───────────────────────────────────────────────────────────

// Original tasks
// console.log('Active users:', getActiveUsers(users));
// console.log('Average age:', getAverageAge(users));
// console.log('Oldest user:', getOldestUser(users));
// console.log('Names:', getUserNames(users));
// console.log('Users by role:', groupUsersByRole(users));
// console.log('Users by status:', countUsersByStatus(users));
// console.log('Unique values:', removeDuplicates([1, 2, 2, 3, 1]));
// console.log('Products by price:', sortProductsByPrice(products));
// console.log('Cart total:', getCartTotal(cart));

// Production-relevant tasks
console.log('\n── Production Tasks ──');
console.log('Search "a":', searchUsers(users, 'a'));
console.log('Sort by age asc:', sortUsersByAge(users, true));
console.log('Inactive users:', getInactiveUsers(users));
console.log('Find by email:', findUserByEmail(users, 'rafi@example.com'));
console.log('Has admin:', hasAdmin(users));
console.log('User emails:', getUserEmails(users));
console.log('Unique roles:', getUniqueRoles(users));
console.log('Youngest user:', getYoungestUser(users));
console.log('Is user 1 active:', isUserActive(users, 1));
console.log('Admin count:', countAdmins(users));
console.log('Active editors:', getActiveEditors(users));
console.log('User by ID 3:', getUserById(users, 3));
console.log('Products 30-100:', getProductsInPriceRange(products, 30, 100));
console.log('Cart quantity:', getTotalCartQuantity(cart));
console.log('Cart summary:', getCartSummary(cart));
