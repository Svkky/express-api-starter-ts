# Notes

dB -- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users ( "Id" integer NOT NULL DEFAULT nextval('"users_Id_seq"'::regclass), firstname text COLLATE pg_catalog."default", lastname text COLLATE pg_catalog."default",
username text COLLATE pg_catalog."default", password text COLLATE pg_catalog."default", walletnumber bigint, walletbalance real, datecreated timestamp with time zone DEFAULT CURRENT_DATE, CONSTRAINT
users_pkey PRIMARY KEY ("Id") )

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users OWNER to postgres;

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users OWNER to postgres;

insert -- sample user ==> INSERT INTO public.users( "Id", firstname, lastname, username, password, walletnumber, walletbalance, datecreated) VALUES (DEFAULT, 'Sunkanmi', 'Yusuf',
'yusufsunkanmi3@gmail.com', 'password123', '08145209317', 0, DEFAULT);

---

-- Table: public.transactions

-- DROP TABLE IF EXISTS public.transactions;

CREATE TABLE IF NOT EXISTS public.transactions ( "Id" integer NOT NULL DEFAULT nextval('"transactions_Id_seq"'::regclass), username text COLLATE pg_catalog."default" NOT NULL, amount real NOT NULL,
authorization_url text COLLATE pg_catalog."default" NOT NULL, access_code text COLLATE pg_catalog."default" NOT NULL, reference text COLLATE pg_catalog."default" NOT NULL, status text COLLATE
pg_catalog."default" NOT NULL DEFAULT 'pending'::text, gateway_response text COLLATE pg_catalog."default", currency text COLLATE pg_catalog."default", transaction_date timestamp with time zone NOT
NULL DEFAULT CURRENT_DATE, "transaction_Id" text COLLATE pg_catalog."default", recipient text COLLATE pg_catalog."default", CONSTRAINT transactions_pkey PRIMARY KEY ("Id", transaction_date) )

TABLESPACE pg_default;

#ALTER TABLE IF EXISTS public.transactions OWNER to postgres;

## ToDos

1. Update logger to winston
2. Write mocha test cases.

Actions so far:

1. done authcontroller ==> pendings : (a). do create user and generate default wallet number upon creation. (b). do update user (c). do get user by email or by userid. (d). do acttivate and deactivate
   user. (e). add isLogged in col to user table, use this to avoid duplicate login

2. done txncontroller ==> pendings : (a). complete confirmtransactionposting, in this, verify the transaction, update trans staus in transaction table and update user balance. Note: if sender is not
   the reciever, that is fund transfer, debit sender and credit reciever.

---

Includes API Server utilities:

-   [morgan](https://www.npmjs.com/package/morgan)
    -   HTTP request logger middleware for node.js
-   [helmet](https://www.npmjs.com/package/helmet)
    -   Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
-   [dotenv](https://www.npmjs.com/package/dotenv)
    -   Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`
-   [cors](https://www.npmjs.com/package/cors)
    -   CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

Development utilities:

-   [typescript](https://www.npmjs.com/package/typescript)
    -   TypeScript is a language for application-scale JavaScript.
-   [ts-node](https://www.npmjs.com/package/ts-node)
    -   TypeScript execution and REPL for node.js, with source map and native ESM support.
-   [nodemon](https://www.npmjs.com/package/nodemon)
    -   nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
-   [eslint](https://www.npmjs.com/package/eslint)
    -   ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
-   [typescript-eslint](https://typescript-eslint.io/)
    -   Tooling which enables ESLint to support TypeScript.
-   [jest](https://www.npmjs.com/package/mocha)
    -   Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
-   [supertest](https://www.npmjs.com/package/supertest)
    -   HTTP assertions made easy via superagent.

## Setup

```
npm install
```

## Development

```
npm run dev
```
