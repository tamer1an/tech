/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
    return knex.schema
        .dropTableIfExists('call_records')
        .then(() => {
            return knex.schema.createTable('call_records', table => {
                table.increments('id').primary();
                table.string('agent_id', 255).notNullable().index();
                table.string('recording_file', 255);
                table.integer('duration').notNullable();
            });
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
    return knex.schema.dropTable('call_records');
};
