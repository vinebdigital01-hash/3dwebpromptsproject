// ==========================================
// APEX3D VAULT - Prompt Catalog Store & CMS Engine
// Syncs default catalog with custom prompts created in Admin Console
// and persists across Cloud Database in real-time
// ==========================================

import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';
import {
  savePromptToFirestore,
  deletePromptFromFirestore,
  fetchPromptsFromFirestore,
  subscribeToFirestorePrompts,
} from './firebase';

const CUSTOM_PROMPTS_KEY = 'apex3d_custom_prompts_v1';
const DELETED_PROMPT_IDS_KEY = 'apex3d_deleted_prompts_v1';

/**
 * Get custom prompts stored in localStorage
 */
function getCustomPrompts(): VaultItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PROMPTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse custom prompts:', err);
  }
  return [];
}

/**
 * Get IDs of deleted prompts (even from default catalog)
 */
function getDeletedPromptIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_PROMPT_IDS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse deleted prompt IDs:', err);
  }
  return [];
}

/**
 * Returns all active prompts: Custom Prompts + Default Prompts minus Deleted ones and overrides
 */
export function getAllVaultPrompts(): VaultItem[] {
  const custom = getCustomPrompts();
  const deletedIds = new Set(getDeletedPromptIds());
  const customIds = new Set(custom.map((p) => p.id));

  // Filter default catalog by deleted IDs AND custom prompt overrides (prevents duplicate prompts!)
  const activeDefaults = VAULT_CATALOG.filter(
    (item) => !deletedIds.has(item.id) && !customIds.has(item.id)
  );

  // Combine custom prompts (at top) with defaults
  return [...custom, ...activeDefaults];
}

/**
 * Add a new prompt (persists to localStorage, Cloud Database, and dispatches sync event)
 */
export function addVaultPrompt(prompt: VaultItem): VaultItem[] {
  if (typeof window === 'undefined') return getAllVaultPrompts();
  try {
    const custom = getCustomPrompts();
    const updatedCustom = [prompt, ...custom.filter((p) => p.id !== prompt.id)];
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(updatedCustom));

    savePromptToFirestore(prompt).catch((err) => console.debug('Cloud save notice:', err));

    window.dispatchEvent(new CustomEvent('apex_prompts_updated', { detail: { action: 'add', prompt } }));
  } catch (err) {
    console.error('Failed to add prompt:', err);
  }
  return getAllVaultPrompts();
}

/**
 * Delete a prompt by ID (handles both custom prompts and default catalog)
 */
export function deleteVaultPrompt(id: string): VaultItem[] {
  if (typeof window === 'undefined') return getAllVaultPrompts();
  try {
    // 1. Remove from custom if present
    const custom = getCustomPrompts();
    const updatedCustom = custom.filter((p) => p.id !== id);
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(updatedCustom));

    // 2. Mark as deleted in deleted IDs
    const deletedIds = getDeletedPromptIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(DELETED_PROMPT_IDS_KEY, JSON.stringify(deletedIds));
    }

    deletePromptFromFirestore(id).catch((err) => console.debug('Cloud delete notice:', err));

    window.dispatchEvent(new CustomEvent('apex_prompts_updated', { detail: { action: 'delete', id } }));
  } catch (err) {
    console.error('Failed to delete prompt:', err);
  }
  return getAllVaultPrompts();
}

/**
 * Update an existing prompt (saves locally and to Cloud Database)
 */
export function updateVaultPrompt(id: string, updates: Partial<VaultItem>): VaultItem[] {
  if (typeof window === 'undefined') return getAllVaultPrompts();
  try {
    const all = getAllVaultPrompts();
    const existing = all.find((p) => p.id === id);
    if (!existing) return all;

    const modified: VaultItem = { ...existing, ...updates };

    const custom = getCustomPrompts();
    const existingCustomIdx = custom.findIndex((p) => p.id === id);

    let updatedCustom: VaultItem[];
    if (existingCustomIdx >= 0) {
      custom[existingCustomIdx] = modified;
      updatedCustom = [...custom];
    } else {
      updatedCustom = [modified, ...custom.filter((p) => p.id !== id)];
    }
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(updatedCustom));

    savePromptToFirestore(modified).catch((err) => console.debug('Cloud update notice:', err));

    window.dispatchEvent(new CustomEvent('apex_prompts_updated', { detail: { action: 'update', prompt: modified } }));
  } catch (err) {
    console.error('Failed to update prompt:', err);
  }
  return getAllVaultPrompts();
}

/**
 * Reset prompts catalog back to pristine default
 */
export function resetToDefaultPrompts(): VaultItem[] {
  if (typeof window === 'undefined') return VAULT_CATALOG;
  try {
    localStorage.removeItem(CUSTOM_PROMPTS_KEY);
    localStorage.removeItem(DELETED_PROMPT_IDS_KEY);
    window.dispatchEvent(new CustomEvent('apex_prompts_updated', { detail: { action: 'reset' } }));
  } catch (err) {
    console.error('Failed to reset prompts:', err);
  }
  return VAULT_CATALOG;
}

let hasInitializedPromptsCloudSync = false;

/**
 * Initialize real-time Cloud Database synchronization for prompts
 * Ensures prompts edited or marked free by Admin appear for all clients and devices instantly
 */
export function initPromptsCloudSync(): () => void {
  if (typeof window === 'undefined' || hasInitializedPromptsCloudSync) {
    return () => {};
  }
  hasInitializedPromptsCloudSync = true;

  // 1. Initial pull
  fetchPromptsFromFirestore()
    .then((cloudPrompts) => {
      if (cloudPrompts && cloudPrompts.length > 0) {
        mergeCloudPrompts(cloudPrompts);
      }
    })
    .catch((err) => console.debug('Initial cloud prompts fetch notice:', err));

  // 2. Real-time subscription
  return subscribeToFirestorePrompts((cloudPrompts) => {
    if (cloudPrompts && cloudPrompts.length > 0) {
      mergeCloudPrompts(cloudPrompts);
    }
  });
}

function mergeCloudPrompts(cloudPrompts: VaultItem[]) {
  try {
    const localCustom = getCustomPrompts();
    const map = new Map<string, VaultItem>();

    // Add local custom first
    localCustom.forEach((p) => map.set(p.id, p));

    // Merge cloud prompts
    cloudPrompts.forEach((cp) => {
      map.set(cp.id, cp);
    });

    const merged = Array.from(map.values());
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('apex_prompts_updated', { detail: { action: 'cloud_sync' } }));
  } catch (err) {
    console.debug('Error merging cloud prompts:', err);
  }
}
