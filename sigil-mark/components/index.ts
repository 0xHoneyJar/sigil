/**
 * Sigil v1.2.4 - Components
 *
 * Context-aware components that automatically inherit physics from SigilZone.
 *
 * @example
 * ```tsx
 * import { SigilZone } from 'sigil-mark/core';
 * import { Button } from 'sigil-mark/components';
 *
 * // Button automatically uses decisive physics in critical zone
 * <SigilZone material="decisive" serverAuthoritative>
 *   <Button onAction={confirmPurchase}>
 *     Confirm Purchase
 *   </Button>
 * </SigilZone>
 *
 * // Same Button automatically uses glass physics in marketing zone
 * <SigilZone material="glass">
 *   <Button onClick={learnMore}>
 *     Learn More
 *   </Button>
 * </SigilZone>
 * ```
 */

export { Button, type ButtonProps } from './button';
