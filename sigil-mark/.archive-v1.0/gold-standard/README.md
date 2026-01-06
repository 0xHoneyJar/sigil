# Gold Standard Reference

> Visual reference assets for the Fidelity Ceiling

## Purpose

This directory contains reference screenshots and components that represent the **maximum allowed fidelity** for this product. The Mod Ghost Rule states:

> "If your output looks 'better' than the Gold Standard, it is WRONG."

## Contents

Add reference assets here:

```
gold-standard/
├── README.md           # This file
├── components/         # Screenshot of ideal component states
│   ├── button.png
│   ├── card.png
│   └── modal.png
├── screens/            # Full page references
│   ├── checkout.png
│   └── dashboard.png
└── motions/            # GIFs of ideal animations
    ├── button-press.gif
    └── page-transition.gif
```

## How to Use

1. Take screenshots of your target aesthetic from the reference era
2. Place them in the appropriate subdirectory
3. Reference these in `/validate` and `/craft` commands

## Era Reference

The fidelity ceiling is set to: **[Configure in essence.yaml]**

Example eras:
- **2007**: Web 2.0, glossy buttons, subtle gradients (OSRS reference)
- **2015**: Flat design, Material Design 1.0
- **2020**: Modern minimalism, subtle depth

## Related Files

- `sigil-mark/kernel/fidelity-ceiling.yaml` - Constraint definitions
- `sigil-mark/soul/essence.yaml` - Era and soul statement
