const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'call_stats_db',
    password: 'pass',
    port: 5432,
});

const convertDurationToSeconds = (duration) => {
    const parts = duration.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    return hours * 3600 + minutes * 60 + seconds;
}

app.get('/aggregate_stats', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT agent_id,
             COUNT(*) AS total_calls,
             COUNT(recording_file) AS calls_with_recording,
             COUNT(*) - COUNT(recording_file) AS calls_without_recording,
             SUM(duration) AS total_duration
      FROM call_records
      GROUP BY agent_id
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const fetchAndStoreData = async () => {
    for (let page = 1; page <= 100; page++) {
        const response = await axios.get(`https://omni.salox.tech/api/v1/fdb659ec6744d718610e47647efbbd7bce77fe025e443dev/cdr?page=${page}`);
        const records = response.data.records;

        for (const record of records) {
            const durationInSeconds = convertDurationToSeconds(record.duration);
            await pool.query(
                'INSERT INTO call_records (agent_id, recording_file, duration) VALUES ($1, $2, $3)',
                [record.agent_id || null, record.recording_file || null, durationInSeconds]
            );
        }
    }
}

app.listen(port, async () => {
    console.log(`App running on port ${port}`);
    await fetchAndStoreData();
    console.log('Data fetched and stored');
});
