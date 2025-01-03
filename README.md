# SEC Vue

Support for sec

*without combine*

```
npm i @vanyamate/sec-vue
```

```typescript
// /action/todo/getTodos.action.ts

const getTodosAction = function (userId: string): Array<Todo> {
    return fetch(`/todos`).then((response) => response.json());
};

```

```typescript
// /model/todo/todo.model.ts
import { store, effect } from '@vanyamate/sec-vue';


const getTodosEffect = effect(getTodosAction);

export const todoLoading = store(false)
    .on(getTodosEffect, 'onBefore', (state) => {
        state.value = true;
    })
    .on(getTodosEffect, 'onFinally', (state) => {
        state.value = false;
    });
```

```typescript jsx
import { useStore } from '@vanyamate/sec-vue';


const loading = useStore(todoLoading);

<template>
    <h2>{{ loading ? 'Загрузка' : '' }}</h2>
</template>;
```
