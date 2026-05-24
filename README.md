# @profullstack/pluginstore

Reusable TypeScript contracts and pure helpers for Profullstack plugin/module store surfaces.

This package intentionally has no framework, database, auth, encryption, or payment dependencies. Apps keep those concerns locally and use this package for the shared store contract: catalog entries, install payloads, config schemas, pricing labels, and installed-state helpers.

## Install

```bash
npm install @profullstack/pluginstore
```

## Usage

```ts
import {
  configSchemaFromFieldSpec,
  createPluginInstallPayload,
  installState,
  splitConfigSchema,
} from "@profullstack/pluginstore";

const configSchema = configSchemaFromFieldSpec({
  secrets: [{ key: "API_KEY", label: "API key", scope: "global" }],
  bools: [{ key: "PLUGIN_ENABLED", label: "Enabled", default: true }],
});

const split = splitConfigSchema(configSchema);

const payload = createPluginInstallPayload({
  name: "example",
  slug: "example",
  version: "1.0.0",
  downloads: 12,
  license: "MIT",
  config_schema: configSchema,
});

const state = installState({
  status: "active",
  version: "1.0.0",
  installed_at: new Date().toISOString(),
});
```

## What It Provides

- Plugin and module catalog types
- Config schema normalization and field-spec conversion
- Secret/plain and global/module field splitting
- Install payload shaping
- Pricing label helpers
- Installed, disabled, removed, and expired state helpers

## Repository

Source: <https://github.com/profullstack/pluginstore>

## License

MIT
