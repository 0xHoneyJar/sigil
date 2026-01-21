/**
 * VocabularyLoader Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, unlink, rmdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  loadVocabulary,
  resolveEffectFromKeywords,
  getDefaultVocabulary,
  clearVocabularyCache,
  isVocabularyCached,
} from './vocabulary-loader.js';

const TEST_DIR = 'test-vocabulary-loader';

const MOCK_LEXICON_MD = `# Sigil: Lexicon

<effect_keywords>
## Effect Keywords

### Financial (Pessimistic, 800ms, Confirmation)
\`\`\`
Primary:    claim, deposit, withdraw
Extended:   stake, unstake, swap
\`\`\`

### Destructive (Pessimistic, 600ms, Confirmation)
\`\`\`
Primary:    delete, remove, destroy
\`\`\`

### Standard (Optimistic, 200ms, No Confirmation)
\`\`\`
Primary:    save, update, edit
\`\`\`

### Local State (Immediate, 100ms)
\`\`\`
Primary:    toggle, switch, expand
\`\`\`
</effect_keywords>

<type_overrides>
## Type Overrides

| Type Pattern | Forced Effect | Why |
|--------------|---------------|-----|
| \`Currency\`, \`Money\` | Financial | Value transfer |
| \`Password\`, \`Secret\` | Destructive | Security |
| \`Theme\`, \`Preference\` | Local | Client-only |
</type_overrides>

<domain_context>
## Domain Context

### Web3/DeFi
\`\`\`
Default:        Financial physics (pessimistic)
Keywords:       wallet, token, nft
\`\`\`
</domain_context>
`;

describe('VocabularyLoader', () => {
  beforeEach(async () => {
    clearVocabularyCache();
    if (!existsSync(TEST_DIR)) {
      await mkdir(TEST_DIR, { recursive: true });
    }
  });

  afterEach(async () => {
    clearVocabularyCache();
    try {
      if (existsSync(`${TEST_DIR}/lexicon.md`)) {
        await unlink(`${TEST_DIR}/lexicon.md`);
      }
      if (existsSync(TEST_DIR)) {
        await rmdir(TEST_DIR);
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getDefaultVocabulary', () => {
    it('returns all expected effect types', () => {
      const vocab = getDefaultVocabulary();

      expect(vocab.effects.has('financial')).toBe(true);
      expect(vocab.effects.has('destructive')).toBe(true);
      expect(vocab.effects.has('soft_delete')).toBe(true);
      expect(vocab.effects.has('standard')).toBe(true);
      expect(vocab.effects.has('local')).toBe(true);
    });

    it('returns financial keywords', () => {
      const vocab = getDefaultVocabulary();
      const financial = vocab.effects.get('financial');

      expect(financial).toBeDefined();
      expect(financial?.keywords).toContain('claim');
      expect(financial?.keywords).toContain('deposit');
      expect(financial?.keywords).toContain('withdraw');
    });

    it('returns type overrides', () => {
      const vocab = getDefaultVocabulary();

      expect(vocab.typeOverrides.get('currency')).toBe('financial');
      expect(vocab.typeOverrides.get('password')).toBe('destructive');
      expect(vocab.typeOverrides.get('theme')).toBe('local');
    });

    it('returns domain defaults', () => {
      const vocab = getDefaultVocabulary();

      expect(vocab.domainDefaults.get('wallet')).toBe('financial');
      expect(vocab.domainDefaults.get('checkout')).toBe('financial');
    });
  });

  describe('loadVocabulary', () => {
    it('returns defaults when file not found', async () => {
      const vocab = await loadVocabulary('nonexistent-file.md');

      expect(vocab.effects.size).toBeGreaterThan(0);
      expect(vocab.effects.has('financial')).toBe(true);
    });

    it('parses vocabulary from markdown file', async () => {
      await writeFile(`${TEST_DIR}/lexicon.md`, MOCK_LEXICON_MD);

      const vocab = await loadVocabulary(`${TEST_DIR}/lexicon.md`);

      expect(vocab.effects.has('financial')).toBe(true);
      expect(vocab.effects.has('destructive')).toBe(true);
      expect(vocab.effects.has('standard')).toBe(true);
      expect(vocab.effects.has('local')).toBe(true);
    });

    it('parses keywords correctly', async () => {
      await writeFile(`${TEST_DIR}/lexicon.md`, MOCK_LEXICON_MD);

      const vocab = await loadVocabulary(`${TEST_DIR}/lexicon.md`);
      const financial = vocab.effects.get('financial');

      expect(financial?.keywords).toContain('claim');
      expect(financial?.keywords).toContain('deposit');
      expect(financial?.keywords).toContain('withdraw');
      expect(financial?.keywords).toContain('stake');
    });

    it('caches loaded vocabulary', async () => {
      await writeFile(`${TEST_DIR}/lexicon.md`, MOCK_LEXICON_MD);

      expect(isVocabularyCached()).toBe(false);

      await loadVocabulary(`${TEST_DIR}/lexicon.md`);
      expect(isVocabularyCached()).toBe(true);
    });

    it('handles malformed markdown gracefully', async () => {
      await writeFile(`${TEST_DIR}/lexicon.md`, 'Not a lexicon');

      const vocab = await loadVocabulary(`${TEST_DIR}/lexicon.md`);

      // Should return defaults
      expect(vocab.effects.has('financial')).toBe(true);
    });
  });

  describe('resolveEffectFromKeywords', () => {
    it('resolves financial keywords', async () => {
      const effect = await resolveEffectFromKeywords(['claim']);
      expect(effect).toBe('financial');
    });

    it('resolves destructive keywords', async () => {
      const effect = await resolveEffectFromKeywords(['delete']);
      expect(effect).toBe('destructive');
    });

    it('resolves standard keywords', async () => {
      const effect = await resolveEffectFromKeywords(['save']);
      expect(effect).toBe('standard');
    });

    it('resolves local keywords', async () => {
      const effect = await resolveEffectFromKeywords(['toggle']);
      expect(effect).toBe('local');
    });

    it('prioritizes financial over standard', async () => {
      // If both claim and save are present, financial wins
      const effect = await resolveEffectFromKeywords(['save', 'claim']);
      expect(effect).toBe('financial');
    });

    it('returns null for unknown keywords', async () => {
      const effect = await resolveEffectFromKeywords(['unknown', 'random']);
      expect(effect).toBeNull();
    });

    it('is case-insensitive', async () => {
      const effect = await resolveEffectFromKeywords(['CLAIM', 'Deposit']);
      expect(effect).toBe('financial');
    });

    it('uses type overrides', async () => {
      const effect = await resolveEffectFromKeywords(['currency']);
      expect(effect).toBe('financial');
    });

    it('uses domain defaults', async () => {
      const effect = await resolveEffectFromKeywords(['wallet']);
      expect(effect).toBe('financial');
    });

    it('uses provided vocabulary', async () => {
      const customVocab = getDefaultVocabulary();
      customVocab.effects.set('financial', {
        keywords: ['custom'],
        effect: 'financial',
        category: 'test',
      });

      const effect = await resolveEffectFromKeywords(['custom'], customVocab);
      expect(effect).toBe('financial');
    });
  });

  describe('clearVocabularyCache', () => {
    it('clears the cache', async () => {
      await writeFile(`${TEST_DIR}/lexicon.md`, MOCK_LEXICON_MD);
      await loadVocabulary(`${TEST_DIR}/lexicon.md`);

      expect(isVocabularyCached()).toBe(true);

      clearVocabularyCache();

      expect(isVocabularyCached()).toBe(false);
    });
  });
});
