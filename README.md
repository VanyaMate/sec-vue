# SEC Vue

Support for sec

```
npm i @vanyamate/sec-vue
```

```typescript
// /model/todo/todo.model.ts
import { store } from '@vanyamate/sec';

export const todoLoading = store(false);
```

```typescript jsx
import { useStore } from '@vanyamate/sec-vue';

const loading = useStore(todoLoading);

<template>
    <h2>{{ loading ? 'Загрузка' : '' }}</h2>
</template>;
```
