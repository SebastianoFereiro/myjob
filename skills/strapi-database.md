# Strapi Database (PostgreSQL + Strapi ORM) Skill

## Обзор
Strapi 5 автоматически генерирует схему базы данных на основе Content Types. Strapi ORM - это встроенный слой для работы с базой данных.

## Content Types и схема БД
- Создание Content Types через Admin Panel или код (`/src/api/[content-type]/content-types/[content-type].schema.json`)
- Strapi автоматически создает таблицы в PostgreSQL
- Поля: String, Text, RichText, Media, Relation, Component, DynamicZone
- Типы контента: Collection types (для списков), Single types (для одиночных записей)

## Relations (Связи)
- One-to-Many: `relation` поле с `target` на другой content type
- Many-to-Many: `relation` поле с `target` и `relationType: "manyToMany"`
- One-to-One: `relation` поле с `relationType: "oneToOne"`
- Настройка через Admin Panel или JSON схему

## Strapi ORM
- Автоматическая генерация SQL запросов
- Параметризованные запросы (защита от SQL injection)
- Lifecycle hooks для манипуляции данными:
  - `beforeCreate`, `afterCreate`
  - `beforeUpdate`, `afterUpdate`
  - `beforeDelete`, `afterDelete`
  - `beforeFind`, `afterFind`
- Доступ к базе данных через `strapi.db` (Query engine)

## Migrations
- Strapi автоматически создает миграции при изменении Content Types
- Ручные миграции: создание SQL файлов в `database/migrations/`
- Команда: `strapi migration:generate`, `strapi migration:run`

## Media Handling
- Upload plugin для работы с файлами и изображениями
- Хранение метаданных в БД, файлов на диске или в облаке (S3, Cloudinary)
- Настройка размеров изображений (responsive images)

## Индексы и оптимизация
- Добавление индексов через JSON схему или миграции
- Оптимизация запросов через populate (жадная загрузка связей)
- Пагинация, фильтрация, сортировка на уровне API

## Пример Lifecycle Hook
```javascript
// src/api/article/content-types/article/lifecycles.js
module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    // Логика перед созданием
  },
  afterCreate(event) {
    const { result } = event;
    // Логика после создания
  }
};
```

## Транзакции
- Использование транзакций в custom plugins/controllers
- `strapi.db.transaction()` для сложных операций
