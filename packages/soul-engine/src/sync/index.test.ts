import { describe, it, expect } from 'vitest';
import { classifyByKeywords, detectSyncStrategy } from './index.js';

describe('classifyByKeywords', () => {
  it('should classify balance-related keywords as server_tick', () => {
    expect(classifyByKeywords('withdraw balance')).toBe('server_tick');
    expect(classifyByKeywords('user wallet')).toBe('server_tick');
    expect(classifyByKeywords('transfer money')).toBe('server_tick');
    expect(classifyByKeywords('player health')).toBe('server_tick');
    expect(classifyByKeywords('inventory update')).toBe('server_tick');
  });

  it('should classify text-related keywords as crdt', () => {
    expect(classifyByKeywords('edit document')).toBe('crdt');
    expect(classifyByKeywords('write comment')).toBe('crdt');
    expect(classifyByKeywords('collaborative text')).toBe('crdt');
    expect(classifyByKeywords('message draft')).toBe('crdt');
  });

  it('should classify preference-related keywords as lww', () => {
    expect(classifyByKeywords('toggle theme')).toBe('lww');
    expect(classifyByKeywords('user preference')).toBe('lww');
    expect(classifyByKeywords('select option')).toBe('lww');
    expect(classifyByKeywords('config setting')).toBe('lww');
  });

  it('should classify ui-related keywords as none', () => {
    expect(classifyByKeywords('open modal')).toBe('none');
    expect(classifyByKeywords('dropdown menu')).toBe('none');
    expect(classifyByKeywords('sidebar panel')).toBe('none');
  });

  it('should return null for unknown patterns', () => {
    expect(classifyByKeywords('random thing')).toBe(null);
    expect(classifyByKeywords('foo bar')).toBe(null);
  });
});

describe('detectSyncStrategy', () => {
  it('should return warnings for server_tick', () => {
    const result = detectSyncStrategy('withdraw from balance');
    expect(result.strategy).toBe('server_tick');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('NEVER use optimistic UI');
  });

  it('should return warnings for crdt', () => {
    const result = detectSyncStrategy('collaborative document editing');
    expect(result.strategy).toBe('crdt');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('presence cursors');
  });

  it('should return null strategy for unknown patterns', () => {
    const result = detectSyncStrategy('unknown pattern xyz');
    expect(result.strategy).toBe(null);
    expect(result.rationale).toContain('requires explicit declaration');
  });
});
