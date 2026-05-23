export const CONFIG_KEY_RE = /^[A-Z][A-Z0-9_]{1,100}$/;
function cleanString(value) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function asConfigField(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return null;
    const raw = value;
    const key = cleanString(raw.key);
    const label = cleanString(raw.label);
    if (!key || !label || !CONFIG_KEY_RE.test(key))
        return null;
    if (!["string", "number", "boolean", "secret", "url"].includes(String(raw.type)))
        return null;
    const defaultValue = typeof raw.default === "string" ||
        typeof raw.default === "number" ||
        typeof raw.default === "boolean" ||
        raw.default === null
        ? raw.default
        : undefined;
    return {
        key,
        label,
        type: raw.type,
        scope: raw.scope === "global" || raw.scope === "module" ? raw.scope : "module",
        required: raw.required === true,
        default: defaultValue,
        placeholder: typeof raw.placeholder === "string" ? raw.placeholder : undefined,
        help: typeof raw.help === "string" ? raw.help : typeof raw.hint === "string" ? raw.hint : undefined,
        hint: typeof raw.hint === "string" ? raw.hint : typeof raw.help === "string" ? raw.help : undefined,
        multiline: raw.multiline === true,
    };
}
function fieldFromDef(type, def) {
    return asConfigField({
        ...def,
        type,
        help: def.help ?? def.hint,
        placeholder: def.placeholder ?? def.hint,
        scope: def.scope ?? "module",
    });
}
export function normalizeConfigSchema(value) {
    if (!Array.isArray(value))
        return [];
    return value.map(asConfigField).filter((field) => field !== null);
}
export function configSchemaFromFieldSpec(spec) {
    if (!spec)
        return [];
    return [
        ...(spec.secrets ?? []).map((field) => fieldFromDef("secret", field)),
        ...(spec.strings ?? []).map((field) => fieldFromDef("string", field)),
        ...(spec.numbers ?? []).map((field) => fieldFromDef("number", field)),
        ...(spec.bools ?? []).map((field) => fieldFromDef("boolean", field)),
        ...(spec.urls ?? []).map((field) => fieldFromDef("url", field)),
    ].filter((field) => field !== null);
}
export function splitConfigSchema(fields) {
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
export function configDefaultValue(field) {
    if (field.default !== undefined && field.default !== null)
        return field.default;
    return field.type === "boolean" ? false : "";
}
export function createPluginInstallPayload(mod) {
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
export function catalogEntryConfig(entry) {
    return normalizeConfigSchema(entry?.config_schema ?? []);
}
export function priceLabel(pricing) {
    if (pricing.model === "free")
        return "Free";
    if (pricing.model === "subscription")
        return `$${pricing.usdPerMonth}/mo`;
    return `${pricing.bps / 100}% rev share`;
}
export function isFreePricing(pricing) {
    return pricing.model === "free";
}
export function isSubscriptionPricing(pricing) {
    return pricing.model === "subscription";
}
export function isRevsharePricing(pricing) {
    return pricing.model === "revshare";
}
export function paidUntilTime(row) {
    if (!row?.paid_until)
        return null;
    const time = new Date(row.paid_until).getTime();
    return Number.isFinite(time) ? time : null;
}
export function installState(row, now = Date.now()) {
    if (!row)
        return "not-installed";
    if (row.status === "removed")
        return "removed";
    if (row.status === "disabled")
        return "disabled";
    const expires = paidUntilTime(row);
    if (expires !== null && expires <= now)
        return "expired";
    return "active";
}
export function isInstalledActive(row, now = Date.now()) {
    return installState(row, now) === "active";
}
export function isInstalledExpired(row, now = Date.now()) {
    return installState(row, now) === "expired";
}
export function shouldRejectDuplicateInstall(row, now = Date.now()) {
    return isInstalledActive(row, now);
}
//# sourceMappingURL=index.js.map