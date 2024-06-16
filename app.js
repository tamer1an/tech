import express from 'express';
import knex from 'knex';
import axios from 'axios';
import { convertDurationToSeconds } from './utils.js';

const app = express();
const port = 3000;

const db = knex({
    client: 'pg',
    connection: {
        user: 'user',
        password: 'pass',
        database: 'call_stats_db',
        host: 'localhost',
        port: 5432,
    },
    pool: { min: 2, max: 10 },
});

app.get('/aggregate_stats', async (req, res) => {
    try {
        const results = await db('call_records')
            .select('agent_id')
            .count('* as total_calls')
            .count('recording_file as calls_with_recording')
            .sum('duration as total_duration')
            .groupBy('agent_id');

        const stats = results.map(row => ({
            agent_id: row.agent_id,
            total_calls: parseInt(row.total_calls, 10),
            calls_with_recording: parseInt(row.calls_with_recording, 10),
            calls_without_recording: parseInt(row.total_calls, 10) - parseInt(row.calls_with_recording, 10),
            total_duration: parseInt(row.total_duration, 10)
        }));

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const fetchAndStoreData = async () => {
    for (let page = 1; page <= 100; page++) {
        const response = await axios.get(`https://omni.salox.tech/api/v1/fdb659ec6744d718610e47647efbbd7bce77fe025e443dev/cdr?page=${page}`);
        const records = response.data.records;

        const formattedRecords = records.map(record => ({
            agent_id: record.agent_id,
            recording_file: record.recording_file || null,
            duration: convertDurationToSeconds(record.duration)
        }));

        await db('call_records').insert(formattedRecords);
    }
}

app.listen(port, async () => {
    console.log(`App running on port ${port}`);
    await fetchAndStoreData();
    console.log('Data fetched and stored');
});
