# Test JavaScript & TypeScript Highlighting

## JavaScript Example

```javascript
// Fonction fléchée ES6
const greet = (name) => {
  console.log(`Hello, ${name}!`);
  return `Welcome to OntoWave`;
};

// Classe ES6
class Component {
  constructor(props) {
    this.props = props;
    this.state = { count: 0 };
  }
  
  increment() {
    this.state.count++;
    console.log('Count:', this.state.count);
  }
}

// Async/Await
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Destructuring & Spread
const user = { name: 'Alice', age: 30, city: 'Paris' };
const { name, ...rest } = user;
const newUser = { ...user, age: 31 };
```

## TypeScript Example

```typescript
// Interface TypeScript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Type générique
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// Classe avec types
class UserService {
  private users: User[] = [];
  
  constructor(private apiUrl: string) {}
  
  async getUser(id: number): Promise<User | null> {
    const response = await fetch(`${this.apiUrl}/users/${id}`);
    const data: ApiResponse<User> = await response.json();
    return data.data;
  }
  
  addUser(user: User): void {
    this.users.push(user);
  }
}

// Fonction avec types
function calculateTotal(items: number[], tax: number = 0.2): number {
  const subtotal = items.reduce((sum, item) => sum + item, 0);
  return subtotal * (1 + tax);
}

// Union types & Type guards
type Shape = Circle | Rectangle | Triangle;

interface Circle {
  kind: 'circle';
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}
```

## Code Inline

Exemple de code inline: `const x = 42;` et aussi `let name: string = "Alice";`

## Conclusion

Ce test vérifie que:
- ✅ JavaScript (ES6+) est correctement coloré
- ✅ TypeScript (types, interfaces, generics) est correctement coloré
- ✅ Les mots-clés sont en couleur
- ✅ Les strings sont en couleur
- ✅ Les commentaires sont en couleur
