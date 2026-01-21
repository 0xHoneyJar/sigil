#!/usr/bin/env node

/**
 * Verify all publishable packages have correct build outputs.
 * Run after `pnpm -r build` to ensure packages are ready for npm publish.
 */

import { readdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

const PACKAGES_DIR = 'packages'

// Find all publishable packages (those with @thehoneyjar scope, not private)
const publishablePackages = readdirSync(PACKAGES_DIR).filter(dir => {
  const pkgPath = join(PACKAGES_DIR, dir, 'package.json')
  if (!existsSync(pkgPath)) return false
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  return !pkg.private && pkg.name?.startsWith('@thehoneyjar/')
})

console.log(`Found ${publishablePackages.length} publishable packages:\n`)

let hasErrors = false

for (const pkgDir of publishablePackages) {
  const pkgPath = join(PACKAGES_DIR, pkgDir, 'package.json')
  const distDir = join(PACKAGES_DIR, pkgDir, 'dist')
  const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'))

  console.log(`Verifying ${pkgJson.name}...`)

  // Check dist exists
  if (!existsSync(distDir)) {
    console.error(`  ❌ dist/ directory missing`)
    hasErrors = true
    continue
  }

  // Check main entry exists
  const mainEntry = join(PACKAGES_DIR, pkgDir, pkgJson.main || 'dist/index.js')
  if (!existsSync(mainEntry)) {
    console.error(`  ❌ Main entry missing: ${pkgJson.main}`)
    hasErrors = true
  } else {
    console.log(`  ✓ Main entry exists`)
  }

  // Check types exist
  const typesEntry = join(PACKAGES_DIR, pkgDir, pkgJson.types || 'dist/index.d.ts')
  if (!existsSync(typesEntry)) {
    console.error(`  ❌ Types missing: ${pkgJson.types}`)
    hasErrors = true
  } else {
    console.log(`  ✓ Types exist`)
  }

  // Check publishConfig
  if (!pkgJson.publishConfig?.access) {
    console.error(`  ❌ Missing publishConfig.access`)
    hasErrors = true
  } else {
    console.log(`  ✓ publishConfig.access: ${pkgJson.publishConfig.access}`)
  }

  // Check repository field
  if (!pkgJson.repository?.url) {
    console.error(`  ❌ Missing repository.url`)
    hasErrors = true
  } else {
    console.log(`  ✓ Repository configured`)
  }

  // Check engines
  if (!pkgJson.engines?.node) {
    console.error(`  ❌ Missing engines.node`)
    hasErrors = true
  } else {
    console.log(`  ✓ Node engine: ${pkgJson.engines.node}`)
  }

  console.log('')
}

if (hasErrors) {
  console.error('❌ Build verification failed')
  process.exit(1)
}

console.log('✓ All builds verified successfully')
