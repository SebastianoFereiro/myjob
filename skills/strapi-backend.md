# Strapi 5 Backend Skill

## Установка и настройка
- Создание проекта: `npx create-strapi@latest my-project`
- Структура папок Strapi 5
- Конфигурация database (PostgreSQL)

## Content Types
- Создание через Admin Panel vs код
- Fields: String, Text, RichText, Media, Relation, Component, DynamicZone
- Lifecycle hooks: beforeCreate, afterCreate, beforeUpdate, afterUpdate, beforeDelete, afterDelete

## API Endpoints
- REST API: /api/[content-type]
- GraphQL: настройка плагина
- Автогенерируемые endpoints (CRUD)
- Фильтрация, сортировка, пагинация

## Authentication & Authorization
- Users-permissions plugin
- Роли и права доступа
- JWT токены
- Настройка CORS для Next.js

## Custom Plugins
- Создание плагина
- Bootstrap и register функции
- Кастомные контроллеры и сервисы

## Media Handling
- Upload plugin
- Работа с изображениями и файлами
- Интеграция с внешними хранилищами (S3, Cloudinary)

## Strapi ORM
- Автоматическая генерация схемы БД из content types
- Relations: One-to-Many, Many-to-Many
- Lifecycle hooks для манипуляции данными
- Strapi migrations vs ручные миграции

## Интеграция с Next.js
- Настройка CORS в Strapi
- Создание типизированных API клиентов
- Обработка ошибок и повторные попытки
- Кеширование запросов
