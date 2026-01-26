#!/usr/bin/env bash
# =============================================================================
# Sigil CLI Installer
# =============================================================================
# Downloads and installs anchor and lens CLIs from GitHub releases.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/rune/main/scripts/install-cli.sh | bash
#
# Environment Variables:
#   SIGIL_CLI_VERSION  - Version to install (default: latest)
#   SIGIL_INSTALL_DIR  - Installation directory (default: ~/.sigil/bin)
#   SIGIL_SKIP_PATH    - Skip PATH modification instructions (default: false)
#   SIGIL_VERIFY       - Verify checksums (default: true)
#
# Exit Codes:
#   0 = success
#   1 = platform not supported
#   2 = download failed
#   3 = verification failed
#   4 = installation failed
# =============================================================================

set -euo pipefail

# Configuration
REPO="0xHoneyJar/rune"
INSTALL_DIR="${SIGIL_INSTALL_DIR:-$HOME/.sigil/bin}"
VERSION="${SIGIL_CLI_VERSION:-latest}"
SKIP_PATH="${SIGIL_SKIP_PATH:-false}"
VERIFY="${SIGIL_VERIFY:-true}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
header() { echo -e "\n${BLUE}$1${NC}"; }

# Cleanup on exit
cleanup() {
    if [[ -n "${TEMP_DIR:-}" ]] && [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

# Platform detection
detect_platform() {
    local os arch

    os=$(uname -s)
    arch=$(uname -m)

    case "$os" in
        Darwin)
            case "$arch" in
                arm64) echo "aarch64-apple-darwin" ;;
                x86_64) echo "x86_64-apple-darwin" ;;
                *) error "Unsupported macOS architecture: $arch"; exit 1 ;;
            esac
            ;;
        Linux)
            case "$arch" in
                x86_64|amd64) echo "x86_64-unknown-linux-gnu" ;;
                aarch64|arm64) echo "aarch64-unknown-linux-gnu" ;;
                *) error "Unsupported Linux architecture: $arch"; exit 1 ;;
            esac
            ;;
        MINGW*|MSYS*|CYGWIN*)
            error "Windows is not supported. Please use WSL (Windows Subsystem for Linux)."
            exit 1
            ;;
        *)
            error "Unsupported operating system: $os"
            exit 1
            ;;
    esac
}

# Get latest version from GitHub
get_latest_version() {
    local response

    # Try to get the latest cli-v* release
    response=$(curl -fsSL "https://api.github.com/repos/$REPO/releases" 2>/dev/null) || {
        warn "Could not fetch releases from GitHub API"
        echo "1.0.0"
        return
    }

    # Find latest cli-v* tag
    echo "$response" \
        | grep -oE '"tag_name": "cli-v[^"]+"' \
        | head -1 \
        | sed -E 's/.*cli-v([^"]+).*/\1/' \
        || echo "1.0.0"
}

# Download archive (does not extract)
download_archive() {
    local name=$1
    local platform=$2
    local version=$3
    local temp_dir=$4

    local archive_name="${name}-${version}-${platform}.tar.gz"
    local url="https://github.com/$REPO/releases/download/cli-v${version}/${archive_name}"

    info "Downloading ${name} v${version}..."

    if ! curl -fsSL -o "$temp_dir/$archive_name" "$url"; then
        error "Failed to download $name from $url"
        error "Please check if the release exists: https://github.com/$REPO/releases/tag/cli-v${version}"
        return 2
    fi
}

# Extract and install binary from verified archive
extract_and_install() {
    local name=$1
    local platform=$2
    local version=$3
    local temp_dir=$4

    local archive_name="${name}-${version}-${platform}.tar.gz"

    # Extract
    tar -xzf "$temp_dir/$archive_name" -C "$temp_dir"

    # Move binary
    if [[ -f "$temp_dir/$name" ]]; then
        mv "$temp_dir/$name" "$INSTALL_DIR/$name"
        chmod +x "$INSTALL_DIR/$name"
    else
        error "Binary $name not found in archive"
        return 4
    fi
}

# Verify checksums against downloaded archives (not extracted binaries)
verify_checksums() {
    local version=$1
    local platform=$2
    local temp_dir=$3

    if [[ "$VERIFY" != "true" ]]; then
        return 0
    fi

    local checksum_url="https://github.com/$REPO/releases/download/cli-v${version}/checksums.sha256"
    local checksum_file="$temp_dir/checksums.sha256"

    info "Downloading checksums..."
    if ! curl -fsSL -o "$checksum_file" "$checksum_url"; then
        warn "Could not download checksum file - skipping verification"
        return 0
    fi

    info "Verifying checksums..."
    cd "$temp_dir"

    # Verify each archive (not extracted binary)
    for binary in anchor lens; do
        local archive_name="${binary}-${version}-${platform}.tar.gz"
        if [[ -f "$archive_name" ]]; then
            local expected
            # Use -F for exact string match to avoid matching multiple platforms
            expected=$(grep -F "$archive_name" "$checksum_file" 2>/dev/null | awk '{print $1}' || true)

            if [[ -z "$expected" ]]; then
                warn "No checksum found for $archive_name - skipping"
                continue
            fi

            local actual
            if command -v sha256sum &>/dev/null; then
                actual=$(sha256sum "$archive_name" | awk '{print $1}')
            elif command -v shasum &>/dev/null; then
                actual=$(shasum -a 256 "$archive_name" | awk '{print $1}')
            else
                warn "No checksum tool available - skipping verification"
                return 0
            fi

            if [[ "$actual" != "$expected" ]]; then
                error "Checksum mismatch for $archive_name"
                error "Expected: $expected"
                error "Actual:   $actual"
                return 3
            fi

            info "$archive_name checksum verified ✓"
        fi
    done
}

# Verify installation
verify_binary() {
    local name=$1

    if "$INSTALL_DIR/$name" --version &>/dev/null; then
        local version
        version=$("$INSTALL_DIR/$name" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
        info "$name installed: v$version"
        return 0
    else
        error "$name installation verification failed"
        return 3
    fi
}

# Detect shell and provide PATH instructions
get_shell_profile() {
    local shell_name
    shell_name=$(basename "${SHELL:-/bin/bash}")

    case "$shell_name" in
        bash)
            if [[ -f "$HOME/.bash_profile" ]]; then
                echo "$HOME/.bash_profile"
            else
                echo "$HOME/.bashrc"
            fi
            ;;
        zsh)
            echo "$HOME/.zshrc"
            ;;
        fish)
            echo "$HOME/.config/fish/config.fish"
            ;;
        *)
            echo "$HOME/.profile"
            ;;
    esac
}

# Main installation
main() {
    header "Sigil CLI Installer"

    # Detect platform
    local platform
    platform=$(detect_platform)
    info "Detected platform: $platform"

    # Get version
    local version="$VERSION"
    if [[ "$version" == "latest" ]]; then
        info "Fetching latest version..."
        version=$(get_latest_version)
    fi
    info "Installing Sigil CLIs v$version"

    # Create directories
    mkdir -p "$INSTALL_DIR"
    TEMP_DIR=$(mktemp -d)

    # Download both archives first
    header "Downloading CLIs..."
    download_archive "anchor" "$platform" "$version" "$TEMP_DIR"
    download_archive "lens" "$platform" "$version" "$TEMP_DIR"

    # Verify checksums against archives before extraction
    verify_checksums "$version" "$platform" "$TEMP_DIR"

    # Extract and install after verification
    header "Installing anchor..."
    extract_and_install "anchor" "$platform" "$version" "$TEMP_DIR"

    header "Installing lens..."
    extract_and_install "lens" "$platform" "$version" "$TEMP_DIR"

    # Verify binaries
    header "Verifying installation..."
    verify_binary "anchor"
    verify_binary "lens"

    # Save version info
    mkdir -p "$(dirname "$INSTALL_DIR")"
    cat > "$INSTALL_DIR/../versions.json" << EOF
{
  "anchor": {
    "version": "$version",
    "installed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "platform": "$platform"
  },
  "lens": {
    "version": "$version",
    "installed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "platform": "$platform"
  }
}
EOF

    # PATH instructions
    header "Installation Complete!"

    if [[ "$SKIP_PATH" != "true" ]]; then
        local in_path=false
        if [[ ":$PATH:" == *":$INSTALL_DIR:"* ]]; then
            in_path=true
        fi

        if ! $in_path; then
            local profile
            profile=$(get_shell_profile)

            echo ""
            warn "Add Sigil to your PATH by adding this to $profile:"
            echo ""
            echo "  export PATH=\"\$HOME/.sigil/bin:\$PATH\""
            echo ""
            echo "Then reload your shell:"
            echo ""
            echo "  source $profile"
            echo ""
        else
            info "Sigil CLIs are already in your PATH"
        fi
    fi

    echo ""
    info "Verify installation:"
    echo "  anchor --version"
    echo "  lens --version"
    echo ""
}

main "$@"
