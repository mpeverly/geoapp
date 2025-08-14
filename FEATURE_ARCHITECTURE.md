# Feature-Based Architecture Guide

## 🏗️ Overview

This project has been restructured into a feature-based architecture to improve maintainability, scalability, and developer experience. Each feature is self-contained with its own components, hooks, types, and services.

## 📁 Directory Structure

```
src/react-app/
├── features/                    # Feature modules
│   ├── quests/                 # Quest management
│   │   ├── components/         # Quest-specific components
│   │   │   ├── QuestCard.tsx
│   │   │   └── QuestTracker.tsx
│   │   ├── hooks/             # Quest-specific hooks
│   │   │   └── useQuests.ts
│   │   ├── types/             # Quest-specific types
│   │   │   └── index.ts
│   │   ├── services/          # Quest-specific services (future)
│   │   └── index.ts           # Feature exports
│   ├── locations/             # Location management
│   │   ├── components/
│   │   │   ├── LocationMap.tsx
│   │   │   └── CheckInCard.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── admin/                 # Admin functionality
│   │   ├── components/
│   │   │   └── AdminPanel.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── auth/                  # Authentication
│   │   ├── components/
│   │   │   └── ShopifyAuth.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts               # All features export
├── shared/                    # Shared utilities
│   ├── components/            # Common UI components
│   ├── hooks/                 # Common React hooks
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Utility functions
│   └── index.ts               # Shared exports
├── App.tsx                    # Main app component
└── main.tsx                   # App entry point
```

## 🎯 Features

### 1. Quests Feature (`features/quests/`)

**Purpose**: Manage adventure quests, tracking, and completion.

**Components**:
- `QuestCard`: Display individual quest information
- `QuestTracker`: Track quest progress and upload photos

**Hooks**:
- `useQuests`: Manage quest state, API calls, and progress tracking

**Types**:
- `QuestProgress`: User's progress on a quest
- `QuestWithSteps`: Quest with its associated steps
- `QuestCompletionData`: Data for completing quest steps

**Usage**:
```typescript
import { QuestCard, QuestTracker, useQuests } from './features/quests';

function MyComponent() {
  const { quests, handleStartQuest, handleCompleteStep } = useQuests();
  
  return (
    <div>
      {quests.map(quest => (
        <QuestCard 
          key={quest.id} 
          quest={quest} 
          onStart={() => handleStartQuest(quest.id)}
        />
      ))}
    </div>
  );
}
```

### 2. Locations Feature (`features/locations/`)

**Purpose**: Manage locations, check-ins, and mapping.

**Components**:
- `LocationMap`: Interactive map with locations
- `CheckInCard`: Check-in functionality for locations

**Types**:
- `LocationWithDistance`: Location with calculated distance
- `CheckInData`: Data for location check-ins

**Usage**:
```typescript
import { LocationMap, CheckInCard } from './features/locations';

function ExplorePage() {
  return (
    <div>
      <LocationMap locations={locations} />
      <CheckInCard location={selectedLocation} />
    </div>
  );
}
```

### 3. Admin Feature (`features/admin/`)

**Purpose**: Administrative functionality for managing content.

**Components**:
- `AdminPanel`: Complete admin interface for quests and locations

**Types**:
- `AdminStats`: Dashboard statistics
- `QuestFormData`: Form data for creating/editing quests

**Usage**:
```typescript
import { AdminPanel } from './features/admin';

function AdminPage() {
  return <AdminPanel />;
}
```

### 4. Auth Feature (`features/auth/`)

**Purpose**: Authentication and user management.

**Components**:
- `ShopifyAuth`: Shopify authentication component

**Types**:
- `AuthUser`: Authenticated user data
- `AuthState`: Authentication state

**Usage**:
```typescript
import { ShopifyAuth } from './features/auth';

function LoginPage() {
  return <ShopifyAuth />;
}
```

## 🔧 Shared Resources

### Shared Types (`shared/types/`)

Common TypeScript interfaces used across features:

```typescript
import { User, Location, Quest, Coordinates } from './shared/types';
```

### Shared Hooks (`shared/hooks/`)

Reusable React hooks:

```typescript
import { useLoading, useLocalStorage, useForm, useApi } from './shared/hooks';
```

### Shared Utils (`shared/utils/`)

Utility functions:

```typescript
import { calculateDistance, formatDate, getCurrentLocation } from './shared/utils';
```

## 📦 Import Patterns

### Feature-Specific Imports
```typescript
// Import specific components
import { QuestCard } from './features/quests/components/QuestCard';

// Import feature exports
import { QuestCard, useQuests } from './features/quests';

// Import all features
import { QuestCard, LocationMap, AdminPanel } from './features';
```

### Shared Imports
```typescript
// Import shared types
import { User, Location } from './shared/types';

// Import shared utilities
import { calculateDistance } from './shared/utils';

// Import shared hooks
import { useLoading } from './shared/hooks';

// Import everything from shared
import * as Shared from './shared';
```

## 🚀 Migration Guide

### From Old Structure to New Structure

**Before**:
```typescript
import { QuestCard } from './components/QuestCard';
import { LocationMap } from './components/LocationMap';
```

**After**:
```typescript
import { QuestCard } from './features/quests';
import { LocationMap } from './features/locations';
```

### Adding New Features

1. **Create feature directory**:
   ```bash
   mkdir -p src/react-app/features/new-feature/{components,hooks,types,services}
   ```

2. **Create feature types**:
   ```typescript
   // features/new-feature/types/index.ts
   export interface NewFeatureData {
     id: string;
     name: string;
   }
   ```

3. **Create feature components**:
   ```typescript
   // features/new-feature/components/NewFeatureComponent.tsx
   import { NewFeatureData } from '../types';
   
   export default function NewFeatureComponent({ data }: { data: NewFeatureData }) {
     return <div>{data.name}</div>;
   }
   ```

4. **Create feature index**:
   ```typescript
   // features/new-feature/index.ts
   export { default as NewFeatureComponent } from './components/NewFeatureComponent';
   export type { NewFeatureData } from './types';
   ```

5. **Update main features index**:
   ```typescript
   // features/index.ts
   export * from './new-feature';
   ```

## 🎨 Best Practices

### 1. Feature Isolation
- Keep features self-contained
- Minimize cross-feature dependencies
- Use shared resources for common functionality

### 2. Type Safety
- Define feature-specific types in `types/index.ts`
- Extend shared types when needed
- Use strict TypeScript configuration

### 3. Component Organization
- Group related components in feature directories
- Use descriptive component names
- Export components through feature index files

### 4. Hook Management
- Create feature-specific hooks for complex state
- Use shared hooks for common patterns
- Keep hooks focused and reusable

### 5. API Integration
- Create feature-specific services for API calls
- Use shared utilities for common API patterns
- Handle errors consistently across features

## 🔄 Context Window Management

### For AI Assistance

When working with specific features, provide focused context:

```typescript
// Focus on quest feature only
"Let's work on the quest tracking feature. Here's the quests feature structure:"
- features/quests/components/QuestTracker.tsx
- features/quests/hooks/useQuests.ts
- features/quests/types/index.ts
```

### For Development

1. **Feature-focused development**: Work on one feature at a time
2. **Clear boundaries**: Define interfaces between features
3. **Shared contracts**: Use shared types for cross-feature communication
4. **Documentation**: Keep feature documentation up to date

## 📈 Benefits

1. **Maintainability**: Easier to find and modify feature-specific code
2. **Scalability**: New features can be added without affecting existing ones
3. **Team Collaboration**: Multiple developers can work on different features
4. **Testing**: Features can be tested in isolation
5. **Code Reuse**: Shared resources reduce duplication
6. **Type Safety**: Better TypeScript support with feature-specific types
7. **Performance**: Potential for code splitting by feature

## 🎯 Next Steps

1. **Complete Migration**: Update all imports to use new structure
2. **Add Shared Components**: Create common UI components
3. **Implement Services**: Add feature-specific API services
4. **Add Tests**: Create feature-specific test suites
5. **Documentation**: Keep this guide updated as the architecture evolves
