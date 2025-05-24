# FAIT Co-op UI Component Library

This directory contains the UI component library for the FAIT Co-op platform. These components are designed to be reusable, accessible, and consistent with the platform's design system.

## Available Components

### Button System
- `Button`: Base button component with various variants and states
- `PrimaryButton`: Pre-configured primary button
- `SecondaryButton`: Pre-configured secondary button
- `InlineButton`: Pre-configured inline/link button

### Card Components
- `Card`: Flexible card container with various variants
- `CardHeader`: Card header component
- `CardTitle`: Card title component
- `CardDescription`: Card description component
- `CardContent`: Card content component
- `CardFooter`: Card footer component

### Form Elements
- `Checkbox`: Checkbox input with label and description
- `RangeSlider`: Range slider with value display
- `ExpandingTextarea`: Textarea that expands as content grows
- `Input`: Text input with label and validation
- `Select`: Select dropdown with options
- `RadioGroup`: Radio button group with options

### Typography System
- `Heading`: Heading component with various levels (h1-h6)
- `Subheading`: Subheading component
- `Paragraph`: Paragraph component
- `Text`: Text component for spans and other inline text

## Usage

Import components from the UI library:

```tsx
import { Button, Card, CardContent, Input } from '../components/ui';
```

### Example

```tsx
<Card>
  <CardHeader>
    <Heading level={3}>Card Title</Heading>
  </CardHeader>
  <CardContent>
    <Input 
      label="Email" 
      type="email" 
      placeholder="Enter your email"
    />
    <PrimaryButton>Submit</PrimaryButton>
  </CardContent>
</Card>
```

## Demo

Visit the Components Demo page at `/components-demo` to see all components in action.
