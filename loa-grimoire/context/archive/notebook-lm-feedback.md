To: System Architect From: Staff Design Engineer Subject: REVIEW: 0xHoneyJar/sigil (feature/sigil-next-version)
I have reviewed the sigil-next-version branch. You have pivoted to "Recipes as Code" (), attempting to solve the abstraction gap by hardcoding physics into TSX components. This aligns with the "Linear Method" of opinionated defaults (), but you have implemented it with a combinatorial fatal flaw.
You are coupling Identity (Button) with Material (Decisive). This will force you to maintain DecisiveButton, GlassButton, and MachineryButton. A design system with 40 components and 3 materials becomes 120 files to maintain.
Here is the review.
1. Weakest Abstraction: The "Recipe" Component Wrapper
The Flaw: You are wrapping standard UI atoms in physics-specific shells (e.g., recipes/decisive/ConfirmButton.tsx vs recipes/glass/HeroReveal.tsx) (). The Reality:
• Combinatorial Explosion: In a real system (Airbnb, Linear), you have ~50 core components (Input, Select, Modal, Card). If each requires a unique "Recipe" file for each Zone (Critical, Admin, Marketing), you enter maintenance hell.
• Prop Drilling Hell: Your ConfirmButton recipe () wraps motion.button. Does it expose disabled? aria-label? onFocus? You will spend years re-exporting HTML attributes through your recipe wrappers.
• The Linear Reality: Linear does not have CriticalButton and MarketingButton. They have a Button that accepts a variant or inherits context ().
2. Broken Workflow: The "Zone Migration" Refactor
The Flaw: Physics are determined by import path, not context. The Friction Point:
• The Scenario: A product engineer builds a feature in src/marketing/ using @sigil/recipes/glass/Button. Six months later, the feature graduates to src/core/ (Critical Zone).
• The Break: The engineer must manually rewrite every import from glass/Button to decisive/Button. They cannot simply move the file; they must refactor the implementation details of every component.
• Comparison: In OSRS, moving from a safe zone to the Wilderness changes the rules (death mechanics), but you don't have to swap your character model (). Your architecture forces a model swap.
3. Missing: Context-Aware Primitives
The Gap: You lack Runtime Context Resolution. The Need:
• Smart Components: I need a <Button /> that asks "Where am I?" and applies the correct physics automatically.
• Airbnb DLS Lesson: Airbnb’s Design Language System () standardized components across platforms (iOS/Android/Web) so designers didn't have to choose "iOS Button" vs "Android Button." Your system forces that choice at the code level.
• Practitioner Need: I need to copy-paste a Form from Admin to Critical and have it automatically tighten up its physics (Machinery → Clay) without me rewriting imports.
4. Concrete Simplification: Physics Tokens & Context
Delete the recipes/decisive/, recipes/glass/ directory structure. Implement a Zone Provider and Physics Tokens.
1. Define Physics as Data (Tokens):
2. Inject via Context (The Zone):
3. Resolve in Component:
Why this preserves the core insight:
• Diffs still show physics: The physics.ts file is version controlled.
• Feel is still enforced: The <SigilZone> enforces the material down the tree.
• Zero Refactors: Moving code from Marketing to Critical automatically adopts Critical physics because the parent Zone changed, not the component import.
Verdict: Stop building a component library for every physics state. Build one library that respects physics.