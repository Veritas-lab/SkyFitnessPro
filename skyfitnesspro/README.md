# SkyFitness Pro

Приложение для онлайн-тренировок.

## Технологии

- Next.js 16.1.2
- React 19.2.3
- TypeScript
- Redux Toolkit
- Axios
- Zod для валидации
- Jest для тестирования

## Установка

```bash
pnpm install
```

## Запуск

```bash
# Разработка
pnpm dev

# Сборка
pnpm build

# Продакшн
pnpm start
```

## Тестирование

Проект использует Jest для unit-тестирования.

### Запуск тестов

```bash
# Запустить все тесты
pnpm test

# Запустить тесты в watch режиме
pnpm test:watch

# Запустить тесты с покрытием
pnpm test:coverage
```

### Структура тестов

Тесты находятся в директориях `__tests__` рядом с тестируемыми файлами:

- `lib/__tests__/` - тесты для утилит и API
- `components/*/__tests__/` - тесты для компонентов
- `store/features/__tests__/` - тесты для Redux slices

### Покрытие

Минимальные пороги покрытия:
- branches: 50%
- functions: 50%
- lines: 50%
- statements: 50%

## Линтинг и форматирование

```bash
# Линтинг
pnpm lint

# Форматирование
pnpm format
```
