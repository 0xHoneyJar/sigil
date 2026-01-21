# Sigil Troubleshooting Guide

Common issues and their resolutions when installing or using Sigil.

---

## Pre-flight Failures

### Node.js Version Too Old

**Problem:**
```
✗ Node.js version 18.x.x is below minimum (20.0.0)
```

**Solution:**
1. Check your current version: `node --version`
2. Update Node.js:
   - macOS: `brew install node@20` or use [nvm](https://github.com/nvm-sh/nvm)
   - Linux: Use [nvm](https://github.com/nvm-sh/nvm) or your package manager
   - Windows: Use [WSL](https://docs.microsoft.com/en-us/windows/wsl/) with nvm

**Verify:**
```bash
node --version  # Should be v20.0.0 or higher
```

---

### Git Not Found

**Problem:**
```
✗ Git not installed
```

**Solution:**
- macOS: `xcode-select --install` (includes git)
- Linux: `sudo apt install git` or `sudo yum install git`
- Windows: Install [Git for Windows](https://gitforwindows.org/)

---

### Not a Git Repository

**Problem:**
```
✗ Not a git repository
```

**Solution:**
Initialize a git repository in your project:
```bash
git init
```

Sigil requires git for version tracking and construct installation.

---

### Loa Framework Not Installed

**Problem:**
```
⚠ Loa framework not detected (optional but recommended)
```

**Impact:** Some Sigil features (Hammer mode, `/understand`, `/plan-and-analyze`) require Loa.

**Solution:**
Install Loa from [github.com/0xHoneyJar/loa](https://github.com/0xHoneyJar/loa):
```bash
# Clone Loa
git clone https://github.com/0xHoneyJar/loa.git

# Mount onto your project
cd your-project
../loa/scripts/install.sh
```

---

## CLI Installation Issues

### PATH Not Configured

**Problem:**
```
⚠ anchor CLI installed but not in PATH
⚠ lens CLI installed but not in PATH
```

**Solution:**
Add Sigil's bin directory to your PATH. Add this line to your shell profile:

**Bash** (`~/.bashrc` or `~/.bash_profile`):
```bash
export PATH="$HOME/.sigil/bin:$PATH"
```

**Zsh** (`~/.zshrc`):
```bash
export PATH="$HOME/.sigil/bin:$PATH"
```

**Fish** (`~/.config/fish/config.fish`):
```fish
set -gx PATH $HOME/.sigil/bin $PATH
```

Then reload your shell:
```bash
source ~/.zshrc  # or ~/.bashrc
```

---

### Binary Permission Denied

**Problem:**
```
-bash: /Users/you/.sigil/bin/anchor: Permission denied
```

**Solution:**
Make the binaries executable:
```bash
chmod +x ~/.sigil/bin/anchor
chmod +x ~/.sigil/bin/lens
```

---

### Download Failed

**Problem:**
```
[ERROR] Failed to download anchor from https://github.com/...
```

**Possible Causes:**
1. **Network issue** — Check your internet connection
2. **GitHub rate limiting** — Wait a few minutes or use a token
3. **Version doesn't exist** — Check available releases

**Solution:**
```bash
# Check available releases
curl -s https://api.github.com/repos/0xHoneyJar/sigil/releases | grep tag_name

# Manually download from GitHub
# Visit: https://github.com/0xHoneyJar/sigil/releases

# Specify a different version
SIGIL_CLI_VERSION=1.0.0 ./scripts/install-cli.sh
```

---

### Checksum Mismatch

**Problem:**
```
[ERROR] Checksum mismatch for anchor
```

**Possible Causes:**
1. **Corrupted download** — Network interruption
2. **Version mismatch** — Old checksum file
3. **Tampered binary** — Security concern

**Solution:**
1. Re-download:
   ```bash
   ./scripts/install-cli.sh --force
   ```

2. Skip verification (not recommended for production):
   ```bash
   SIGIL_VERIFY=false ./scripts/install-cli.sh
   ```

3. If persistent, report to [issues](https://github.com/0xHoneyJar/sigil/issues)

---

## npm Package Issues

### Scope Confusion (@sigil vs @thehoneyjar)

**Problem:**
```
npm ERR! 404 '@sigil/hud@*' is not in the npm registry.
```

**Explanation:**
The `@sigil` npm scope is not owned by this project. Official packages use `@thehoneyjar`:

| Intended Package | Actual Package |
|------------------|----------------|
| `@sigil/hud` | `@thehoneyjar/sigil-hud` |
| `@sigil/diagnostics` | `@thehoneyjar/sigil-diagnostics` |
| `@sigil/dev-toolbar` | `@thehoneyjar/sigil-dev-toolbar` |

**Solution:**
Use the correct scope:
```bash
npm install @thehoneyjar/sigil-hud
```

Or use an alias if you prefer the shorter import:
```bash
npm install @sigil/hud@npm:@thehoneyjar/sigil-hud
```

---

### Peer Dependency Warnings

**Problem:**
```
npm WARN peer react@"^18.0.0" from @thehoneyjar/sigil-hud@0.1.0
```

**Solution:**
Ensure you have React 18+ installed:
```bash
npm install react@^18.0.0 react-dom@^18.0.0
```

---

### pnpm/yarn Not Detected

**Problem:**
Mount script suggests npm but you use pnpm/yarn.

**Solution:**
The script auto-detects from lockfiles:
- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- `package-lock.json` → npm

If detection fails, install manually:
```bash
# pnpm
pnpm add @thehoneyjar/sigil-hud

# yarn
yarn add @thehoneyjar/sigil-hud

# npm
npm install @thehoneyjar/sigil-hud
```

---

## Platform Issues

### Windows Not Supported

**Problem:**
```
[ERROR] Windows is not supported. Please use WSL (Windows Subsystem for Linux).
```

**Solution:**
1. Install [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install)
2. Install Ubuntu from Microsoft Store
3. Run Sigil from within WSL:
   ```bash
   wsl
   cd /mnt/c/your/project
   /mount sigil
   ```

---

### Unsupported Architecture

**Problem:**
```
[ERROR] Unsupported architecture: armv7l
```

**Supported architectures:**
- macOS: arm64 (Apple Silicon), x86_64 (Intel)
- Linux: x86_64, aarch64

**Solution:**
If you're on an unsupported architecture, build from source:
```bash
cd sigil/anchor-rust
cargo build --release
```

---

### macOS Gatekeeper Blocking

**Problem:**
```
"anchor" cannot be opened because the developer cannot be verified.
```

**Solution:**
Allow the binary in System Preferences or run:
```bash
xattr -d com.apple.quarantine ~/.sigil/bin/anchor
xattr -d com.apple.quarantine ~/.sigil/bin/lens
```

---

## Verification Failures

### Rules Missing

**Problem:**
```
✗ Rules missing (found 5, expected >= 20)
```

**Solution:**
Re-run installation with force:
```bash
./scripts/mount-sigil.sh --force
```

Or manually copy rules:
```bash
cp -r sigil/.claude/rules/* .claude/rules/
```

---

### /craft Command Not Found

**Problem:**
```
✗ /craft command missing
```

**Solution:**
Ensure commands are copied:
```bash
mkdir -p .claude/commands
cp sigil/.claude/commands/*.md .claude/commands/
```

---

### Grimoire Not Initialized

**Problem:**
```
✗ Grimoire missing
```

**Solution:**
Create the grimoire structure:
```bash
mkdir -p grimoires/sigil/pub/{requests,responses}
touch grimoires/sigil/taste.md
```

---

## Common Runtime Issues

### jq Not Installed (for update-sigil.sh)

**Problem:**
```
[ERROR] jq is required for version checking.
```

**Solution:**
Install jq:
- macOS: `brew install jq`
- Linux: `sudo apt install jq`

---

### Rust Not Installed (for building from source)

**Problem:**
```
[WARN] Rust not installed (required only for building CLIs from source)
```

**Impact:** Cannot build CLIs from source, but pre-built binaries work.

**Solution (if you want to build from source):**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

---

## Getting Help

If your issue isn't listed here:

1. **Check existing issues:** [github.com/0xHoneyJar/sigil/issues](https://github.com/0xHoneyJar/sigil/issues)
2. **Run diagnostics:**
   ```bash
   ./scripts/preflight-sigil.sh --json
   ./scripts/verify-sigil.sh
   ```
3. **Open a new issue** with the diagnostic output

---

## Quick Diagnostic Commands

```bash
# Full pre-flight check
./scripts/preflight-sigil.sh

# Verification
./scripts/verify-sigil.sh

# Check CLI versions
anchor --version
lens --version

# Check installed rules
find .claude/rules -name "*.md" | wc -l

# Check taste log
cat grimoires/sigil/taste.md

# Check update status
./scripts/update-sigil.sh --check
```
