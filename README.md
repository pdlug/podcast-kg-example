# Building a podcast knowledge graph with LLMs

## Getting started

```bash
$ pnpm install
```

Edit `.env` and set the `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` environment variables.

The script `src/index.ts` will read the transcript from `examples/output.json` and use the `buildGraph` function to build a knowledge graph:

```bash
$ npx tsx src/index.ts
```

The raw knowledge graph will be written to `kg.json` and the knowledge graph in DOT format will be written to `kg.dot`.

If you have [Graphviz](https://graphviz.org/) installed, you can visualize the knowledge graph with:

```bash
$ dot -Tpng -o kg.png kg.dot
```

## Notes

This is a very naive approach, missing some very basic things like:

- Chunking -- if the transcript is too long for the context window of the model we're calling, we'll get an error
- Prompts -- pretty basic prompt, we can improve it a lot, include context on our goals/constraints/domain/etc.
- Relationship directions -- the LLM doesn't always get it right and we haven't hinted it to tell it what direction to go in
- Relationship/node constraints -- we haven't provided any hints to the LLM to tell it what types of relationships are allowed between which node types.

The models don't do a great job of respecting enums and discriminated unions in the schema. They generally follow the union for the node types but sometimes add other types so we can't use the discriminated union or risk rejecting the output, same with the string enum for the edge types. Instead of enforcing edge types to be one of the allowed values, we just allow any string and give it examples of what we allow in a description.

The more robust approach lists node/edge types explicitly in addition to the JSON schema. If you want to write code that let's you define the graph schema and automatically get all this synced up and validated, use [Caden AI](https://cadenai.com/) 😀.
