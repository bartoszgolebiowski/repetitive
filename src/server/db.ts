import { env } from '~/env.mjs';
import { Kysely, } from "kysely";
import { type DB } from "./db.types";
import { NeonDialect } from 'kysely-neon';

const qb = new Kysely<DB>({
  dialect: new NeonDialect({
    connectionString: env.PG_DATABASE_URL,
  }),
})

export default qb