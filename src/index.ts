import * as fs from "node:fs";

import { createOpenAI } from "@ai-sdk/openai";

import { buildGraph, validateGraph } from "./builder";
import { kgToDOT } from "./dot";

import env from "./env";

const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

const model = openai("gpt-4o-mini");

const content = fs.readFileSync(
  "./examples/lex_ai_aravind_srinivas.json",
  "utf8",
);

const data = JSON.parse(content);

// Text transcript from the episode from Deepgram, in the raw format their JS SDK returns
const transcript = data.results.channels[0].alternatives[0].transcript;

// Inject some metadata we'd have from the feed itself or other sources
const text = `
Podcast: Lex Fridman Podcast Episode 434
Title: Aravind Srinivas: Perplexity CEO on Future of AI, Search & the Internet

${transcript}
`;

console.time("Execution Time");

const graph = await buildGraph(model, text);

console.timeEnd("Execution Time");

validateGraph(graph);

fs.writeFileSync("./kg.json", JSON.stringify(graph, undefined, 2));
fs.writeFileSync("./kg.dot", kgToDOT(graph));
