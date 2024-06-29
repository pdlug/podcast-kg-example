import * as fs from 'node:fs';

import { buildGraph } from './builder';
import { kgToDOT } from './dot';

const content = fs.readFileSync('./examples/lex_ai_aravind_srinivas.json', 'utf8');

const data = JSON.parse(content);

// Text transcript from the episode from Deepgram, in the raw format their JS SDK returns
const transcript = data.results.channels[0].alternatives[0].transcript;

// Inject some metadata we'd have from the feed itself or other sources
const text = `
Podcast: Lex Fridman Podcast Episode 434
Title: Aravind Srinivas: Perplexity CEO on Future of AI, Search & the Internet

${transcript}
`;

const graph = await buildGraph('openai', 'gpt-4o', text);

fs.writeFileSync('./kg.json', JSON.stringify(graph, undefined, 2));
fs.writeFileSync('./kg.dot', kgToDOT(graph));
