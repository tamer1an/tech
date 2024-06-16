export default {
    client: 'pg',
    connection: {
        user: 'user',
        password: 'pass',
        database: 'call_stats_db',
        host: 'localhost',
        port: 5432
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
};