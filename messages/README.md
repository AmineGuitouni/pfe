# Translation Structure

This project uses next-intl with a folder-based translation structure for better organization and maintainability.

## Structure

```
messages/
├── en/
│   ├── common.ts      # Common UI elements (buttons, labels, etc.)
│   ├── auth.ts        # Authentication related translations
│   ├── dashboard.ts   # Dashboard specific translations
│   ├── home.ts        # Home page translations
│   ├── navigation.ts  # Navigation elements
│   ├── errors.ts      # Error messages
│   └── forms.ts       # Form field labels and validation messages
├── fr/
│   ├── common.ts
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── home.ts
│   ├── navigation.ts
│   ├── errors.ts
│   └── forms.ts
├── ar/
│   ├── common.ts
│   ├── auth.ts
│   └── ... (other namespaces)
└── de/
    ├── common.ts
    ├── auth.ts
    └── ... (other namespaces)
```

## Usage

### Using Hooks (Recommended)

```tsx
import { useCommonTranslations, useAuthTranslations } from '@/hooks/useTranslations';

export function MyComponent() {
  const common = useCommonTranslations();
  const auth = useAuthTranslations();

  return (
    <div>
      <h1>{common('welcome')}</h1>
      <button>{auth('signIn')}</button>
      <button>{common('cancel')}</button>
    </div>
  );
}
```

### Using useTranslations Directly

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  const auth = useTranslations('auth');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{auth('signIn')}</button>
    </div>
  );
}
```

## Available Namespaces

- **common**: General UI elements, buttons, labels
- **auth**: Authentication and user management
- **dashboard**: Dashboard specific content
- **home**: Home page content
- **navigation**: Navigation elements and menus
- **errors**: Error messages and validation
- **forms**: Form fields and input labels

## Adding New Translations

1. Add the key to the appropriate TypeScript file in each language folder
2. Update the TypeScript interface in `src/types/translations.ts`
3. Use the translation in your component

### Example: Adding a new common translation

1. Add to `messages/en/common.ts`:
```typescript
export default {
  // ...existing translations...
  "newKey": "New Translation"
};
```

2. Add to other language files (`fr/common.ts`, `ar/common.ts`, etc.)

3. Update `src/types/translations.ts`:
```typescript
export interface CommonTranslations {
  // ...existing properties...
  newKey: string;
}
```

4. Use in component:
```tsx
const common = useCommonTranslations();
return <span>{common('newKey')}</span>;
```

## Adding New Namespaces

1. Create new `.ts` files in each language folder
2. Add the namespace to `TranslationNamespace` type in `src/lib/translations.ts`
3. Add the namespace to the `namespaces` array in `loadTranslations` function
4. Create a TypeScript interface in `src/types/translations.ts`
5. Add the interface to the `Messages` interface
6. Optionally, create a custom hook in `src/hooks/useTranslations.ts`

## Type Safety

The translation system is fully typed with TypeScript. You'll get autocomplete and type checking for:
- Available namespaces
- Translation keys within each namespace
- Function parameters and return types

## Benefits of This Structure

1. **Better Organization**: Related translations are grouped together
2. **Easier Maintenance**: Smaller files are easier to manage
3. **Type Safety**: Full TypeScript support with autocomplete
4. **Selective Loading**: Only load the translations you need
5. **Developer Experience**: Dedicated hooks for each namespace
6. **Scalability**: Easy to add new languages and namespaces
