# Muscle Feed – Сервис доставки питания

![CI/CD Status](https://github.com/vetrovegor/muscle-feed-backend/actions/workflows/deploy.yml/badge.svg)

🌐 **Сайт проекта:** [https://muscle-feed.co.il/ru](https://muscle-feed.co.il/ru)

---

## 📦 О проекте

**Muscle Feed** — это израильский сервис доставки сбалансированного питания. Приложение реализовано с использованием Node.js, PostgreSQL и Prisma ORM.

---

## 🚀 Быстрый старт

### 📋 Требования

- **Node.js**: `22.16.0`
- **PostgreSQL**: `v16`

### 🔧 Установка и запуск

1. **Клонируйте репозиторий:**

   ```bash
   git clone https://github.com/vetrovegor/muscle-feed-backend.git
   cd muscle-feed-backend
   ```

2. **Создайте файл переменных окружения:**

   ```bash
   cp .env.example .env
   ```

   Заполните файл `.env` актуальными значениями.

3. **Установите зависимости:**

   ```bash
   npm install
   ```

4. **Примените миграции Prisma:**

   ```bash
   npx prisma migrate deploy
   ```

5. **Сгенерируйте Prisma Client:**

   ```bash
   npx prisma generate
   ```

6. **Запуск приложения в режиме разработки:**

   ```bash
   npm run start:dev
   ```

---

## 🛠 Администрирование

Чтобы выдать права модератора/администратора пользователю (с ID = 1), выполните SQL-запрос:

```sql
UPDATE users
SET roles = array_append(roles, 'MODERATOR')
WHERE id = 1;

UPDATE users
SET roles = array_append(roles, 'ADMIN')
WHERE id = 1;
```
