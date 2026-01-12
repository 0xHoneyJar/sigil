# Sigil Design Decisions

This directory contains locked design decisions.

## Purpose

When a design decision is made through the consultation process, it gets recorded here with:
- The decision itself
- Rationale and context
- Lock duration
- Unlock conditions

## Format

Each decision is a YAML file:

```yaml
id: decision-001
title: "Motion timing for critical zone"
decision: "Use server-tick (600ms) for all critical zone interactions"
rationale: "Financial transactions need time for user to process"
locked_at: "2026-01-11"
locked_until: "2026-04-11"
unlock_requires: "taste-key-holder approval"
```

## Current Decisions

*None yet - decisions will be added as they are made through `/consult`.*
