# Call Stats API

## Setup Instructions

1. Clone the repository:
   ```sh
   git clone git@github.com:tamer1an/tech.git
   cd tech
   ```
1. Install the dependencies:

    ```sh
    npm install
    ```
 
1. Generate using 
   `npx knex migrate:latest`

1. Or set up PostgreSQL manually and create the database:
 ```sql
 CREATE DATABASE call_stats_db;

 CREATE TABLE call_records (
   id SERIAL PRIMARY KEY,
   agent_id VARCHAR NOT NULL,
   recording_file VARCHAR,
   duration INTEGER NOT NULL
 );

 ```

1. Run `node app`

1. Visit http://localhost:3000/aggregate_stats
