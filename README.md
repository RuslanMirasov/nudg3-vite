# 🧾 Отчёт о техническом прогрессе проекта

Данный документ описывает текущее состояние проекта после проведённого рефакторинга и устранения технических проблем, перечисленных в исходном
техническом долге. Все пункты соответствуют оригинальной нумерации задач.

<br>
<br>

## 1. Wasteful Next.js Usage

<b>Статус:</b> ✅ Исправлено

Проект полностью переведён с <b>Next.js</b> на <b>Vite 7 + React 19</b>, что устранило избыточную серверную инфраструктуру. Теперь используется
<b>SPA-архитектура</b> с клиентской маршрутизацией через <b>TanStack Router</b> и управлением данными через <b>TanStack React Query</b>.

### Результат:

- Время сборки и размер бандла значительно снижены.
- Убраны неиспользуемые SSR-механизмы.
- Кодовая база стала проще, а навигация — типобезопасной.

<br>
<br>

## 2. Over-fetching & Multiple API Calls

<b>Статус:</b> ✅ Исправлено

Все разрозненные вызовы <b>fetch()</b> заменены на единый слой <b>API</b> через <b>Axios</b> `(apiClient.ts)`.

### Добавлены:

- Централизованный базовый URL и заголовки;
- Перехватчики запросов и ответов (инъекция токена, обработка 401);
- Типизированные методы `api.get/post/put/delete`.

### Результат:

- Устранено дублирование запросов;
- Кэширование данных реализовано через <b>React Query<b> `(staleTime: 5 минут)`;
- Повторных вызовов `/auth/me` при переходах больше нет.

<br>
<br>

## 3. Context API Overuse

<b>Статус:</b> ✅ Исправлено

Старая модель авторизации на <b>Context + useState</b> заменена на гибрид <b>React Query + Context</b>.

### Теперь:

- пользователь кэшируется в запросе `['currentUser']`;
- `AuthProvider` стал тонким слоем управления сессией;
- обновление и выход происходят через кэш <b>React Query</b>, без ручного состояния.

<br>
<br>

## 4. Filter Persistence (or Lack Thereof)

<b>Статус:</b> ⚙️ В процессе

Механизм сохранения фильтров в URL или локальном состоянии пока не реализован. Предусмотрено использование React Router searchParams, но потребуется
дополнительная интеграция на уровне Dashboard-страниц.

<br>
<br>

## 5. Large Component Files

<b>Статус:</b> ⚙️ Частично решено

Основная архитектура компонентов упрощена, общие layout-части вынесены в `AppLayout`, а бизнес-логика — в `features`. Тем не менее, некоторые страницы
(например, Dashboard или Workspaces) нуждаются в декомпозиции.

<br>
<br>

## 6. Inconsistent Error Handling

<b>Статус:</b> ✅ Исправлено

Все ошибки теперь обрабатываются централизованно в Axios-перехватчиках. Удалён устаревший `ApiError` класс. Ошибки API теперь возвращаются в
унифицированном формате и корректно логируются.

### Результат:

- Единая обработка ошибок на уровне приложения;
- Чистый код без дублирования `try/catch`;
- Подготовка к показу уведомлений `(toast)` в будущем.

<br>
<br>

## 7. TypeScript: Too Strict or Too Loose?

<b>Статус:</b> ✅ Исправлено

Включён строгий режим компилятора `("strict": true)`. Активированы флаги: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters`.

### Результат:

- Все API-ответы типизированы через интерфейсы;
- Исключены неявные `any`;
- Безопасное автодополнение в `IDE`.

<br>
<br>

## 8. Performance: Unnecessary Re-renders

<b>Статус:</b> ✅ Исправлено

Основная причина лишних перерисовок `(Context-переменные)` устранена. `React Query` теперь обновляет только те компоненты, которые подписаны на
конкретные данные. Используются `useCallback` и `memo`-паттерны для оптимизации.

<br>
<br>

## 9. No Testing

<b>Статус:</b> ❌ Не реализовано

Автоматические тесты (unit и integration) пока отсутствуют. Запланировано внедрение `Vitest` или `Jest` после завершения оптимизаций бизнес-логики.

<br>
<br>

## 10. Accessibility Concerns

<b>Статус:</b> ⚙️ В процессе

Базовые правила доступности включены (eslint-plugin-jsx-a11y):

- alt-text,
- anchor-is-valid,
- click-events-have-key-events.

Планируется расширение покрытия (лейблы, фокус, контрастность).

<br>
<br>

## 11. Code Organization: Flat Structure

<b>Status:</b> ✅ Fixed

The project has been refactored to a `feature-based` architecture:

```arduino
config/                       // Project configuration files
 └─ validate-env.ts           // Runtime environment variable validation

src/
 ├─ app/                      // Global settings and root routing
 │   ├─ App.tsx               // Main application component
 │   ├─ globals.css           // Global styles
 │   └─ router.tsx            // TanStack Router configuration
 │
 ├─ features/                 // Feature-based modules
 │   ├─ auth/                 // Authentication module
 │   │   ├─ api/              // API endpoints and backend communication
 │   │   ├─ components/       // Auth-specific UI components
 │   │   ├─ hooks/            // Custom hooks (login, logout, etc.)
 │   │   ├─ lib/              // Utility functions
 │   │   ├─ providers/        // Context providers (e.g. AuthProvider)
 │   │   └─ types/            // Type definitions and interfaces
 │   │
 │   └─ workspace/            // Workspaces feature module
 │
 ├─ pages/                    // Route pages
 │   ├─ BillingPage.tsx
 │   ├─ ChatResponsesPage.tsx
 │   ├─ CompetitorsPage.tsx
 │   ├─ DashboardPage.tsx
 │   ├─ LoginPage.tsx
 │   ├─ PromptsPage.tsx
 │   ├─ SourcesPage.tsx
 │   ├─ WorkspaceSettingsPage.tsx
 │   └─ WorkspacesPage.tsx
 │
 └─ shared/                   // Reusable shared modules
     ├─ components/           // UI components and shared interface elements
     │   ├─ index.ts          // Centralized re-exports for all shared components
     │   ├─ ui/               // Base UI components
     │   ├─ common/           // Common visual components
     │   └─ layout/           // Layout and structure components
     │
     ├─ hooks/                // Shared React hooks
     ├─ layouts/              // Page templates and layouts
     ├─ lib/                  // Shared utilities and helper functions
     ├─ providers/            // Global context providers (e.g. ThemeProvider)
     └─ types/                // Global types and interfaces

```

### Additional Improvements

A <b>centralized re-export system</b> was introduced in `shared/components/index.ts`, combining all subdirectories (`ui`, `common`, `layout`) into a
single entry point:

```arduino
// COMPONENTS RE-EXPORTS
export * from './layout';
export * from './common';
export * from './ui';
```

This allows importing any shared component in a unified and flexible way:

```arduino
// Both options now work:
import { Button } from '@/shared/components/ui';
import { Button } from '@/shared/components';
```

### Benefits:

- Single entry point for all shared components
- Shorter and cleaner import paths, regardless of nesting level
- Better scalability — centralized control over exports and module structure
- Clean architecture — clear separation between shared, features, app, and pages layers
- Easier navigation — each feature is isolated and self-contained
- Simplified refactoring — changes in structure no longer break imports

### Possible Drawback:

⚠️ When adding new components, they must be manually added to the index.ts export file. <br> However, this is a minor trade-off for maintaining
clarity and consistency across the codebase.

<br> <br>

## 12. Environment Configuration

<b>Статус:</b> ✅ Исправлено

Добавлены и документированы переменные окружения:

- шаблон `.env.example` с пометками `[REQUIRED]` / `[OPTIONAL]`;
- файл `config/validate-env.ts` выполняет проверку обязательных переменных при старте сборки.

### Результат:

- Приложение не запускается без критических конфигураций;
- Логика проверки выводит инструкции в консоль;
- Среда разработки унифицирована для всей команды.

<br>
<br>
<br>

# 📊 Итоговое состояние

```
| Категория              | Статус
| ---------------------- | ----------------------------------
| Архитектура и сборка   | ✅ Полностью перенесено на Vite
| API слой               | ✅ Централизован и типизирован
| Авторизация и сессии   | ✅ Оптимизировано через React Query
| Типизация              | ✅ Строгая, без `any`
| Ошибки и обработка     | ✅ Единообразно
| Производительность     | ✅ Улучшена
| ESLint и правила       | ✅ Современный Flat Config
| Доступность            | ⚙️ В процессе
| Тестирование           | ❌ Не реализовано
| Конфигурация окружения | ✅ Валидируется и документирована
```
