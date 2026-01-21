---
severity: medium
zones: [standard, critical]
tags: [animation, dialog, modal, radix, base-ui, tailwind]
libraries: [radix-ui, base-ui, tailwindcss-animate]
---

# Dialog Transform Centering Conflicts with CSS Animations

## The Pattern

Using transform-based centering (`translate-x-[-50%] translate-y-[-50%]`) on dialogs/modals that also have CSS zoom/scale animations.

## Why It Breaks

CSS animations reset transform values during the animation. When centering depends on transforms:

```css
/* Centering via transform */
left: 50%;
top: 50%;
transform: translateX(-50%) translateY(-50%);

/* Animation resets the transform */
@keyframes zoom-in {
  from { transform: scale(0.95); }  /* Centering transforms are LOST */
  to { transform: scale(1); }
}
```

**Result**: Dialog appears in bottom-right corner instead of center.

## Affected Libraries

| Library | Default Centering | Animation Conflict? |
|---------|-------------------|---------------------|
| Radix UI | Transform-based | Yes |
| Base UI | Transform-based | Yes |
| shadcn/ui | Inherits from Radix | Yes |
| Headless UI | Flexbox | No |

## The Fix: Flexbox Centering Wrapper

Wrap the dialog content in a flexbox-centered container:

```tsx
<DialogPortal>
  <DialogOverlay />
  {/* Flexbox centering - avoids transform conflicts */}
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <DialogPrimitive.Content
      className="... data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]"
    >
      {children}
    </DialogPrimitive.Content>
  </div>
</DialogPortal>
```

## Base UI Specific

Base UI's `Dialog` component uses similar transform centering. Apply the same flexbox wrapper pattern:

```tsx
import { Dialog } from '@base-ui-components/react/dialog';

<Dialog.Portal>
  <Dialog.Backdrop />
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <Dialog.Popup className="animate-in zoom-in-95">
      {children}
    </Dialog.Popup>
  </div>
</Dialog.Portal>
```

## When Transform Centering IS Safe

- No CSS animations on the dialog itself
- Using JavaScript-based animation (Framer Motion handles transforms separately)
- Animation only affects opacity, not scale/zoom

## Detection Signals

When `/craft` generates dialog/modal components, check for:
1. `translate-x-[-50%]` or `translate-y-[-50%]` in styles
2. `animate-in`, `zoom-in`, `scale-` in same component
3. Both present = flag for flexbox wrapper

## References

- [Radix Themes Discussion #271](https://github.com/radix-ui/themes/discussions/271)
- [Base UI Dialog API](https://base-ui.com/react/components/dialog)

## Related

- See: `05-sigil-animation.md` for animation physics
- See: `spinner-anxiety.md` for loading state patterns
