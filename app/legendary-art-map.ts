/**
 * V83 ART PATH FIX
 *
 * Normal cards AND legendary cards now use /card-art/<cardId>.webp.
 * This map is kept only for the five legacy time cards whose base image files
 * do not exist in the current project, so they do not become broken images.
 */
export const LEGENDARY_PREMIUM_ART: Readonly<Record<string, string>> = {
  'v37_time_unit_09': '/card-art/v37_time_unit_09_legendary_premium_v4.webp?v=v83-art-path-fix',
  'v37_time_spell_05': '/card-art/v37_time_spell_05_legendary_premium_v4.webp?v=v83-art-path-fix',
  'v37_time_trap_05': '/card-art/v37_time_trap_05_legendary_premium_v4.webp?v=v83-art-path-fix',
  'v37_time_spell_10': '/card-art/v37_time_spell_10_legendary_premium_v4.webp?v=v83-art-path-fix',
  'v37_time_spell_14': '/card-art/v37_time_spell_14_legendary_premium_v4.webp?v=v83-art-path-fix',
};
