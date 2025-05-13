# React to SvelteKit Migration Guide

This guide outlines the process for migrating React applications to SvelteKit within the FAIT monorepo.

## Migration Steps

### 1. Create a new SvelteKit app

For each React app you want to migrate:

```bash
# Create the directory structure
mkdir -p apps/[app-name]-sveltekit/src/{lib/{components,utils},routes}

# Copy configuration files from the template
cp packages/sveltekit-template/{svelte.config.js,vite.config.js,tsconfig.json,tailwind.config.js,postcss.config.js} apps/[app-name]-sveltekit/

# Copy basic app structure
cp packages/sveltekit-template/src/app.html packages/sveltekit-template/src/app.css apps/[app-name]-sveltekit/src/
```

### 2. Create package.json

Create a `package.json` file for your new SvelteKit app:

```json
{
  "name": "[app-name]-sveltekit",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint ."
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.1.1",
    "@sveltejs/kit": "^2.5.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.56.0",
    "eslint-plugin-svelte": "^2.35.1",
    "postcss": "^8.4.35",
    "svelte": "^4.2.12",
    "svelte-check": "^3.6.3",
    "tailwindcss": "^3.4.1",
    "tslib": "^2.6.2",
    "typescript": "^5.3.3",
    "vite": "^5.1.4"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.7",
    "date-fns": "^3.3.1",
    "lucide-svelte": "^0.344.0",
    "zod": "^3.22.4"
  }
}
```

### 3. Create basic layout and routes

Create a basic layout file at `src/routes/+layout.svelte`:

```svelte
<script>
  import '../app.css';
</script>

<slot />
```

Create a home page at `src/routes/+page.svelte`.

### 4. Migrate components from React to Svelte

#### React Component:
```jsx
import React from 'react';

function Button({ variant = 'primary', size = 'md', children, onClick }) {
  const variantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    outline: 'bg-transparent border border-gray-300 text-gray-700'
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  const classes = `${variantClasses[variant]} ${sizeClasses[size]} rounded-md`;

  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
```

#### Svelte Component:
```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'outline' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const variantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    outline: 'bg-transparent border border-gray-300 text-gray-700'
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  $: classes = `${variantClasses[variant]} ${sizeClasses[size]} rounded-md`;
</script>

<button class={classes} on:click>
  <slot />
</button>
```

### 5. Migrate routing

#### React Router:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### SvelteKit Routing:
Create files in the `src/routes` directory:
- `src/routes/+page.svelte` (Home)
- `src/routes/about/+page.svelte` (About)
- `src/routes/contact/+page.svelte` (Contact)

### 6. Migrate state management

#### React useState:
```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

#### Svelte state:
```svelte
<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<div>
  <p>Count: {count}</p>
  <button on:click={increment}>Increment</button>
</div>
```

### 7. Migrate data fetching

#### React useEffect:
```jsx
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

#### SvelteKit data loading:
```svelte
<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<ul>
  {#each data.users as user}
    <li>{user.name}</li>
  {/each}
</ul>
```

```js
// src/routes/+page.js
export async function load({ fetch }) {
  const response = await fetch('/api/users');
  const users = await response.json();

  return { users };
}
```

## Testing Your Migration

After migrating a React app to SvelteKit:

1. Run the development server:
   ```bash
   cd apps/[app-name]-sveltekit
   npm run dev
   ```

2. Check for any errors in the console
3. Verify that all routes and functionality work as expected
4. Run the build process to ensure it compiles correctly:
   ```bash
   npm run build
   ```

## Common Migration Challenges

- **React Context → Svelte Stores**: Replace React Context with Svelte stores
- **React Hooks → Svelte Reactivity**: Replace React hooks with Svelte's reactive declarations
- **JSX → Svelte Templates**: Convert JSX syntax to Svelte's template syntax
- **CSS-in-JS → Scoped CSS**: Convert CSS-in-JS solutions to Svelte's scoped CSS

## Using Shared UI Components

The FAIT monorepo includes a shared UI component library for SvelteKit applications. These components provide consistent styling and behavior across all FAIT applications.

### Installing the UI Package

In your SvelteKit app's `package.json`, add the UI package as a dependency:

```json
"dependencies": {
  "@fait/sveltekit-ui": "workspace:*",
  // other dependencies...
}
```

### Using the Components

Import components from the UI package in your Svelte files:

```svelte
<script>
  import { Button, Card, Input } from '@fait/sveltekit-ui';
</script>

<Card title="Login Form">
  <form on:submit|preventDefault={handleSubmit}>
    <Input
      label="Email"
      type="email"
      bind:value={email}
      required
    />

    <div class="mt-4">
      <Button type="submit" fullWidth>Sign In</Button>
    </div>
  </form>
</Card>
```

### Available Components

The UI package includes the following components:

- `Alert` - Display informational messages
- `Button` - Interactive button with various styles
- `Card` - Container for related content
- `Checkbox` - Selectable checkbox input
- `Input` - Text input field
- `Select` - Dropdown selection field

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [React to Svelte Cheatsheet](https://svelte-from-react.netlify.app/)
