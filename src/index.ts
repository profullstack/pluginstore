export type PluginConfigFieldType = "string" | "number" | "boolean" | "secret" | "url";
export type PluginConfigScope = "global" | "module";
export type PluginKind = "connector" | "strategy" | "module";
export type PluginStoreStatus = "ready" | "preview" | "coming-soon";
export type InstalledPluginStatus = "active" | "disabled" | "removed" | string;
export type NormalizedInstallState = "not-installed" | "active" | "disabled" | "expired" | "removed";

export interface PluginConfigField {
  key: string;
  label: string;
  type: PluginConfigFieldType;
  scope?: PluginConfigScope;
  required?: boolean;
  default?: string | number | boolean | null;
  placeholder?: string;
  help?: string;
  hint?: string;
  multiline?: boolean;
}

export interface PluginFieldDef {
  key: string;
  label: string;
  hint?: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  default?: string | number | boolean | null;
  scope?: PluginConfigScope;
  multiline?: boolean;
}

export interface PluginFieldSpec {
  secrets?: PluginFieldDef[];
  strings?: PluginFieldDef[];
  numbers?: PluginFieldDef[];
  bools?: PluginFieldDef[];
  urls?: PluginFieldDef[];
}

export interface PluginManifest {
  id: string;
  kind: PluginKind;
  version: string;
  name: string;
  author?: string;
  description?: string;
  capabilities: string[];
}

export type PluginPricing =
  | { model: "free" }
  | { model: "subscription"; usdPerMonth: number }
  | { model: "revshare"; bps: number };

export interface CatalogEntry {
  manifest: PluginManifest;
  status: PluginStoreStatus;
  pricing: PluginPricing;
  tagline?: string;
  config_schema?: PluginConfigField[];
  config_notes?: string | null;
}

export interface PluginInstallArtifact {
  npm_package: string | null;
  git_url: string | null;
  tarball_url: string | null;
}

export interface PluginInstallPayload {
  name: string;
  slug: string;
  version: string;
  downloads: number;
  license: string | null;
  min_version: string | null;
  os_support: string[] | null;
  config_schema: PluginConfigField[];
  config_notes: string | null;
  install: PluginInstallArtifact;
}

export interface UserInstalledPlugin {
  plugin_id?: string;
  module_id?: string;
  module_slug?: string;
  version: string;
  status: InstalledPluginStatus;
  installed_at: string;
  updated_at?: string;
  paid_until?: string | null;
}

export interface InstallPayloadSource {
  name: string;
  slug: string;
  version: string;
  downloads?: number | null;
  license?: string | null;
  min_version?: string | null;
  min_threatcrush_version?: string | null;
  os_support?: string[] | null;
  config_schema?: unknown;
  config_notes?: string | null;
  npm_package?: string | null;
  git_url?: string | null;
  tarball_url?: string | null;
}

export const CONFIG_KEY_RE = /^[A-Z][A-Z0-9_]{1,100}$/;

function cleanString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asConfigField(value: unknown): PluginConfigField | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const key = cleanString(raw.key);
  const label = cleanString(raw.label);
  if (!key || !label || !CONFIG_KEY_RE.test(key)) return null;
  if (!["string", "number", "boolean", "secret", "url"].includes(String(raw.type))) return null;

  const defaultValue =
    typeof raw.default === "string" ||
    typeof raw.default === "number" ||
    typeof raw.default === "boolean" ||
    raw.default === null
      ? raw.default
      : undefined;

  return {
    key,
    label,
    type: raw.type as PluginConfigFieldType,
    scope: raw.scope === "global" || raw.scope === "module" ? raw.scope : "module",
    required: raw.required === true,
    default: defaultValue,
    placeholder: typeof raw.placeholder === "string" ? raw.placeholder : undefined,
    help: typeof raw.help === "string" ? raw.help : typeof raw.hint === "string" ? raw.hint : undefined,
    hint: typeof raw.hint === "string" ? raw.hint : typeof raw.help === "string" ? raw.help : undefined,
    multiline: raw.multiline === true,
  };
}

function fieldFromDef(type: PluginConfigFieldType, def: PluginFieldDef): PluginConfigField | null {
  return asConfigField({
    ...def,
    type,
    help: def.help ?? def.hint,
    placeholder: def.placeholder ?? def.hint,
    scope: def.scope ?? "module",
  });
}

export function normalizeConfigSchema(value: unknown): PluginConfigField[] {
  if (!Array.isArray(value)) return [];
  return value.map(asConfigField).filter((field): field is PluginConfigField => field !== null);
}

export function configSchemaFromFieldSpec(spec: PluginFieldSpec | null | undefined): PluginConfigField[] {
  if (!spec) return [];
  return [
    ...(spec.secrets ?? []).map((field) => fieldFromDef("secret", field)),
    ...(spec.strings ?? []).map((field) => fieldFromDef("string", field)),
    ...(spec.numbers ?? []).map((field) => fieldFromDef("number", field)),
    ...(spec.bools ?? []).map((field) => fieldFromDef("boolean", field)),
    ...(spec.urls ?? []).map((field) => fieldFromDef("url", field)),
  ].filter((field): field is PluginConfigField => field !== null);
}

export function splitConfigSchema(fields: readonly PluginConfigField[]) {
  return {
    secrets: fields.filter((field) => field.type === "secret"),
    plain: fields.filter((field) => field.type !== "secret"),
    global: fields.filter((field) => field.scope === "global"),
    module: fields.filter((field) => (field.scope ?? "module") === "module"),
    strings: fields.filter((field) => field.type === "string" || field.type === "url"),
    numbers: fields.filter((field) => field.type === "number"),
    bools: fields.filter((field) => field.type === "boolean"),
  };
}

export function configDefaultValue(field: PluginConfigField): string | number | boolean {
  if (field.default !== undefined && field.default !== null) return field.default;
  return field.type === "boolean" ? false : "";
}

export function createPluginInstallPayload(mod: InstallPayloadSource): PluginInstallPayload {
  return {
    name: mod.name,
    slug: mod.slug,
    version: mod.version,
    downloads: mod.downloads || 0,
    license: mod.license || null,
    min_version: mod.min_version || mod.min_threatcrush_version || null,
    os_support: mod.os_support || null,
    config_schema: normalizeConfigSchema(mod.config_schema),
    config_notes: mod.config_notes || null,
    install: {
      npm_package: mod.npm_package || null,
      git_url: mod.git_url || null,
      tarball_url: mod.tarball_url || null,
    },
  };
}

export function catalogEntryConfig(entry: Pick<CatalogEntry, "config_schema"> | null | undefined): PluginConfigField[] {
  return normalizeConfigSchema(entry?.config_schema ?? []);
}

export function priceLabel(pricing: PluginPricing): string {
  if (pricing.model === "free") return "Free";
  if (pricing.model === "subscription") return `$${pricing.usdPerMonth}/mo`;
  return `${pricing.bps / 100}% rev share`;
}

export function isFreePricing(pricing: PluginPricing): boolean {
  return pricing.model === "free";
}

export function isSubscriptionPricing(pricing: PluginPricing): pricing is { model: "subscription"; usdPerMonth: number } {
  return pricing.model === "subscription";
}

export function isRevsharePricing(pricing: PluginPricing): pricing is { model: "revshare"; bps: number } {
  return pricing.model === "revshare";
}

export function paidUntilTime(row: Pick<UserInstalledPlugin, "paid_until"> | null | undefined): number | null {
  if (!row?.paid_until) return null;
  const time = new Date(row.paid_until).getTime();
  return Number.isFinite(time) ? time : null;
}

export function installState(
  row: Pick<UserInstalledPlugin, "status" | "paid_until"> | null | undefined,
  now = Date.now(),
): NormalizedInstallState {
  if (!row) return "not-installed";
  if (row.status === "removed") return "removed";
  if (row.status === "disabled") return "disabled";
  const expires = paidUntilTime(row);
  if (expires !== null && expires <= now) return "expired";
  return "active";
}

export function isInstalledActive(
  row: Pick<UserInstalledPlugin, "status" | "paid_until"> | null | undefined,
  now = Date.now(),
): boolean {
  return installState(row, now) === "active";
}

export function isInstalledExpired(
  row: Pick<UserInstalledPlugin, "status" | "paid_until"> | null | undefined,
  now = Date.now(),
): boolean {
  return installState(row, now) === "expired";
}

export function shouldRejectDuplicateInstall(
  row: Pick<UserInstalledPlugin, "status" | "paid_until"> | null | undefined,
  now = Date.now(),
): boolean {
  return isInstalledActive(row, now);
}
