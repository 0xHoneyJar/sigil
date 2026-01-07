---
severity: high
zones: [critical]
tags: [loading, ux]
---

# Spinner Anxiety

## The Pattern
Loading spinners during financial transactions.

## Why to Avoid
- Creates uncertainty ("Is it working?")
- No sense of progress
- Users may rage-click, causing duplicate transactions

## What to Do Instead
1. Skeleton loading with deliberate reveal
2. Progress indicators with copy ("Confirming transaction...")
3. Immediate optimistic UI with server reconciliation
