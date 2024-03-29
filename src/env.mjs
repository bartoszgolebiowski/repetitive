import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  CLERK_SECRET_KEY: z.string(),
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.input<typeof server>]: string | undefined }}
 */
export const serverEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.input<typeof client>]: string | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT:
    process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT,
};

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: serverEnv.DATABASE_URL,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT:
    process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (
  !!process.env.SKIP_ENV_VALIDATION == false &&
  process.env.NODE_ENV !== "test"
) {
  const isServer = typeof window === "undefined";

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug

      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
