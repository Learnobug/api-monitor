import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  // Strip sslmode from the connection string — we configure SSL explicitly
  // This prevents the pg-connection-string security warning
  const cleanedUrl = connectionString.replace(/[?&]sslmode=[^&]*/gi, (match) =>
    match.startsWith("?") ? "?" : ""
  ).replace(/\?$/, "");
  const pool = new pg.Pool({
    connectionString: cleanedUrl,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getLazyPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Proxy defers client creation until first property access (query call)
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getLazyPrisma(), prop, receiver);
  },
});

export * from "./generated/prisma/client.js";
export type { ApiEndpoint, ApiCheck } from "./generated/prisma/client.js";
