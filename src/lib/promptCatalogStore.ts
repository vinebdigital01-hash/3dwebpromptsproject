// ==========================================
// APEX3D VAULT - Prompt Catalog Store & CMS Engine
// Syncs default catalog with custom prompts created in Admin Console
// and persists across Cloud Database in real-time without relying on localStorage
// ==========================================

import { VAULT_CATALOG, VaultItem, isPromptFree } from '../data/vaultCatalog';
import {
  savePromptToFirestore,
  deletePromptFromFirestore,
  fetchPromptsFromFirestore,
  subscribeToFirestorePrompts,
} from './firebase';

const CUSTOM_PROMPTS_KEY = 'apex3d_custom_prompts_v1';
const DELETED_PROMPT_IDS_KEY = 'apex3d_deleted_prompts_v1';

// In-memory cache for ultra-fast access across components & zero latency
const inMemoryCloudPrompts = new Map<string, VaultItem>();
const inMemoryDeletedIds = new Set<string>();

// Pre-load from localStorage cache if available for instant paint
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(CUSTOM_PROMPTS_KEY);
    if (raw) {
      const parsed: VaultItem[] = JSON.parse(raw);
      parsed.forEach((p) => {
        if (p && p.id) inMemoryCloudPrompts.set(p.id, p);
      });
    }
    const rawDel = localStorage.getItem(DELETED_PROMPT_IDS_KEY);
    if (rawDel) {
      const parsedDel: string[] = JSON.parse(rawDel);
      parsedDel.forEach((id) => inMemoryDeletedIds.add(id));
    }
  } catch {
    // Ignore cache load errors
  }
}

/**
 * Returns all active prompts: Custom Prompts + Default Prompts minus Deleted ones and cloud overrides
 */
export function getAllVaultPrompts(): VaultItem[] {
  const customList: VaultItem[] = [];
  const defaultList: VaultItem[] = [];

  const defaultIds = new Set(VAULT_CATALOG.map((item) => item.id));

  // 1. Process default items with any cloud/admin overrides
  VAULT_CATALOG.forEach((defaultItem) => {
    // Check if deleted
    if (inMemoryDeletedIds.has(defaultItem.id)) return;

    // Check if there is an override in memory
    const override = inMemoryCloudPrompts.get(defaultItem.id);
    if (override) {
      if (override.isDeleted) return;
      defaultList.push({ ...defaultItem, ...override });
    } else {
      defaultList.push(defaultItem);
    }
  });

  // 2. Process custom prompts created via Admin CMS
  inMemoryCloudPrompts.forEach((prompt, id) => {
    if (!defaultIds.has(id) && !inMemoryDeletedIds.has(id) && !prompt.isDeleted) {
      customList.push(prompt);
    }
  });

  // Sort custom prompts newest first, followed by default catalog
  return [...customList, ...defaultList];
}

/**
 * Add a new prompt (persists directly to Firestore Cloud Database and syncs locally)
 */
export function addVaultPrompt(prompt: VaultItem): VaultItem[] {
  if (typeof window === 'undefined') return getAllVaultPrompts();

  try {
    inMemoryCloudPrompts.set(prompt.id, prompt);
    inMemoryDeletedIds.delete(prompt.id);

    // Save to Firestore Cloud Database
    savePromptToFirestore(prompt).catch((err) => console.debug('Cloud save notice:', err));

    // Update fallback cache
    syncToLocalStorage();

    window.dispatchEvent(new CustomEvent('apex_prompts_updated', { detail: { action: 'add', prompt } }));
  } catch (err) {
    console.error('Failed to add prompt:', err);
  }
  return getAllVaultPrompts();
}

/**
 * Delete a prompt by ID (persists directly to Firestore Cloud Database)
 */
export function deleteVaultPrompt(id: string): VaultItem[] {
  if (typeof window === 'undefined') return getAllVaultPrompts();

  try {
    inMemoryDeletedIds.add(id);
    const existing = inMemoryCloudPrompts.get(id);
    if (existing) {
      existing.isDeleted = true;
      inMemoryCloudPrompts.set(id, existing);
    } else {
      inMemoryCloudPrompts.set(id, { id, isDeleted: true } as any);
    }

    // Persist deletion to Firestore
    deletePromptFromFirestore(id).catch((err) => console.debug('Cloud delete notice:', err));
    savePromptToFirestore({ id, isDeleted: true }).catch((err) => console.debug('Cloud mark deleted notice:', err));

    syncToLocalStorage();

    window.dispatchEvent(new CustomEvent('apex_prompts_updated', { detail: { action: 'delete', id } }));
  } catch (err) {
    console.error('Failed to delete prompt:', err);
  }
  return getAllVaultPrompts();
}

/**
 * Update an existing prompt (persists directly to Firestore Cloud Database)
 */
export function updateVaultPrompt(id: string, updates: Partial<VaultItem>): VaultItem[] {
  if (typeof window === 'undefined') return getAllVaultPrompts();

  try {
    const all = getAllVaultPrompts();
    const existing = all.find((p) => p.id === id);
    if (!existing) return all;

    const modified: VaultItem = { ...existing, ...updates };

    inMemoryCloudPrompts.set(id, modified);
    inMemoryDeletedIds.delete(id);

    // Persist to Firestore Cloud Database
    savePromptToFirestore(modified).catch((err) => console.debug('Cloud update notice:', err));

    syncToLocalStorage();

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
    inMemoryCloudPrompts.clear();
    inMemoryDeletedIds.clear();
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
  if (typeof window === 'undefined') {
    return () => {};
  }

  // 1. Initial pull from Firestore
  fetchPromptsFromFirestore()
    .then((cloudPrompts) => {
      if (cloudPrompts && cloudPrompts.length > 0) {
        mergeCloudPrompts(cloudPrompts);
      }
    })
    .catch((err) => console.debug('Initial cloud prompts fetch notice:', err));

  // 2. Real-time subscription to Firestore collection
  const unsub = subscribeToFirestorePrompts((cloudPrompts) => {
    if (cloudPrompts && cloudPrompts.length > 0) {
      mergeCloudPrompts(cloudPrompts);
    }
  });

  return unsub;
}

function mergeCloudPrompts(cloudPrompts: VaultItem[]) {
  try {
    let changed = false;
    cloudPrompts.forEach((cp) => {
      if (cp && cp.id) {
        if (cp.isDeleted) {
          inMemoryDeletedIds.add(cp.id);
        }
        inMemoryCloudPrompts.set(cp.id, cp);
        changed = true;
      }
    });

    if (changed) {
      syncToLocalStorage();
      window.dispatchEvent(new CustomEvent('apex_prompts_updated', { detail: { action: 'cloud_sync' } }));
    }
  } catch (err) {
    console.debug('Error merging cloud prompts:', err);
  }
}

function syncToLocalStorage() {
  try {
    const list = Array.from(inMemoryCloudPrompts.values());
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(list));
    localStorage.setItem(DELETED_PROMPT_IDS_KEY, JSON.stringify(Array.from(inMemoryDeletedIds)));
  } catch {
    // Ignore storage quota errors
  }
}
