# How to use Prisma-cli

> <https://www.prisma.io/docs/getting-started/quickstart>

When finished schema writing, two thing needed to do next:

1. for a new project(no tables on server yet)

create tables and synchronize tables

```bash
nlx prisma migrate dev --name init
```

or if something were changed

```bash
nlx prisma db push
```

> generate is called under the hood by default, after running prisma migrate dev. If the prisma-client-js generator is defined in your schema, this will check if @prisma/client is installed and install it if it's missing.

so, its unnecessary to run `prisma generate`

2. for an exists project

pull from server

```bash
nlx prisma db pull
```
