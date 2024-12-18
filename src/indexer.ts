import fs from "node:fs";

import kuzu from "kuzu";

import { createDB, loadKnowledgeGraph } from "./db";

const kg = JSON.parse(fs.readFileSync("./kg.json", "utf8"));

const db = new kuzu.Database("./demo_db");
const conn = new kuzu.Connection(db);

await createDB(conn, kg);
await loadKnowledgeGraph(conn, kg);

await conn.close();
