---
source: "Stripe"
url: "https://stripe.com/checkout"
zones: [critical]
materials: [decisive]
terms: [deposit, withdraw]
captured: 2026-01-06
tags: [motion, confirmation, financial]
---

# Stripe Checkout Confirmation

## What I Love

- **Deliberate motion** on confirmation (~800ms animation)
- Clear visual hierarchy with prominent trust indicators
- Two-step confirmation pattern for financial actions
- Progressive disclosure of payment details

## Key Pattern

The confirmation animation is intentionally slow (~800ms), giving weight to the financial action. This creates a sense of gravitas that builds user confidence.

## Design Notes

### Motion Timing
- Confirmation: 800ms ease-out
- Success checkmark: 600ms spring
- Failure shake: 400ms

### Visual Hierarchy
1. Amount (largest, bold)
2. Merchant name
3. Card last 4 digits
4. Trust badges

## Why This Matters

In critical financial contexts, instant transitions feel cheap and untrustworthy. Deliberate motion communicates: "We're taking your money seriously."

## Reference

See: Motion Design Principles for timing guidelines.
