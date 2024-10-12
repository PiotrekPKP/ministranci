import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./scheme";

const sql = neon(process.env.MINISTRANCI_USERS_DB!, {
  fetchOptions: { cache: "no-store" }, //fetchoptions... nie chachuje itemow i szybciej dziala po reload strony
});
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
