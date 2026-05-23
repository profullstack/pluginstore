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
export type PluginPricing = {
    model: "free";
} | {
    model: "subscription";
    usdPerMonth: number;
} | {
    model: "revshare";
    bps: number;
};
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
export declare const CONFIG_KEY_RE: RegExp;
export declare function normalizeConfigSchema(value: unknown): PluginConfigField[];
export declare function configSchemaFromFieldSpec(spec: PluginFieldSpec | null | undefined): PluginConfigField[];
export declare function splitConfigSchema(fields: readonly PluginConfigField[]): {
    secrets: PluginConfigField[];
    plain: PluginConfigField[];
    global: PluginConfigField[];
    module: PluginConfigField[];
    strings: PluginConfigField[];
    numbers: PluginConfigField[];
    bools: PluginConfigField[];
};
export declare function configDefaultValue(field: PluginConfigField): string | number | boolean;
export declare function createPluginInstallPayload(mod: InstallPayloadSource): PluginInstallPayload;
export declare function catalogEntryConfig(entry: Pick<CatalogEntry, "config_schema"> | null | undefined): PluginConfigField[];
export declare function priceLabel(pricing: PluginPricing): string;
export declare function isFreePricing(pricing: PluginPricing): boolean;
export declare function isSubscriptionPricing(pricing: PluginPricing): pricing is {
    model: "subscription";
    usdPerMonth: number;
};
export declare function isRevsharePricing(pricing: PluginPricing): pricing is {
    model: "revshare";
    bps: number;
};
export declare function paidUntilTime(row: Pick<UserInstalledPlugin, "paid_until"> | null | undefined): number | null;
export declare function installState(row: Pick<UserInstalledPlugin, "status" | "paid_until"> | null | undefined, now?: number): NormalizedInstallState;
export declare function isInstalledActive(row: Pick<UserInstalledPlugin, "status" | "paid_until"> | null | undefined, now?: number): boolean;
export declare function isInstalledExpired(row: Pick<UserInstalledPlugin, "status" | "paid_until"> | null | undefined, now?: number): boolean;
export declare function shouldRejectDuplicateInstall(row: Pick<UserInstalledPlugin, "status" | "paid_until"> | null | undefined, now?: number): boolean;
//# sourceMappingURL=index.d.ts.map