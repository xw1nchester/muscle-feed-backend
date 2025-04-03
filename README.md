![CI/CD Status](https://github.com/vetrovegor/muscle-feed-backend/actions/workflows/deploy.yml/badge.svg)

Требуется установленный NodeJS версии 20.10.0

СУБД PostgreSQL версии 16

Скопируйте и заполните файл .env:
cp .env.example .env

Установите зависимости:
npm i

Примените миграции:
npx prisma migrate dev

Сгенерируйте Prisma Client:
npx prisma generate

Запуск приложения:
npm run start:dev

Выдача админки с помощью SQL запроса:
update users u 
set roles = array_append(roles, 'ADMIN')
where id = 1