import { env } from '~/env.mjs';
import { Kysely, PostgresDialect, } from "kysely";
import { type DB } from "./types";
import { Pool } from 'pg';

const qb = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: env.DATABASE_URL
        })
    })
})

export type QB = typeof qb
export default qb