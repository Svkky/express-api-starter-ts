const { Client } = require('pg');

const postgreconn = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'SqlDev@1',
    database: 'p2pDB'
});

postgreconn.connect(async (err: any) => {
    if (err) throw err;
    console.log('postgres connection successful');
});

export { postgreconn };
