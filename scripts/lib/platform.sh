#!/usr/bin/env bash
# =============================================================================
# Platform Detection Utilities
# =============================================================================
# Shared functions for platform detection across Sigil scripts.
#
# Usage:
#   source scripts/lib/platform.sh
#   platform=$(detect_platform)
#   rust_target=$(detect_rust_target)
#   pkg_manager=$(detect_package_manager)
# =============================================================================

# Detect platform for binary downloads
# Returns: darwin-arm64, darwin-x64, linux-x64, linux-arm64
# Exits with error on unsupported platforms
detect_platform() {
    local os arch

    os=$(uname -s)
    arch=$(uname -m)

    case "$os" in
        Darwin)
            case "$arch" in
                arm64) echo "darwin-arm64" ;;
                x86_64) echo "darwin-x64" ;;
                *)
                    echo "Error: Unsupported macOS architecture: $arch" >&2
                    return 1
                    ;;
            esac
            ;;
        Linux)
            case "$arch" in
                x86_64|amd64) echo "linux-x64" ;;
                aarch64|arm64) echo "linux-arm64" ;;
                *)
                    echo "Error: Unsupported Linux architecture: $arch" >&2
                    return 1
                    ;;
            esac
            ;;
        MINGW*|MSYS*|CYGWIN*)
            echo "Error: Windows is not supported. Please use WSL (Windows Subsystem for Linux)." >&2
            return 1
            ;;
        *)
            echo "Error: Unsupported operating system: $os" >&2
            return 1
            ;;
    esac
}

# Detect Rust target triple
# Returns: aarch64-apple-darwin, x86_64-apple-darwin, x86_64-unknown-linux-gnu, aarch64-unknown-linux-gnu
detect_rust_target() {
    local os arch

    os=$(uname -s)
    arch=$(uname -m)

    case "$os" in
        Darwin)
            case "$arch" in
                arm64) echo "aarch64-apple-darwin" ;;
                x86_64) echo "x86_64-apple-darwin" ;;
                *)
                    echo "Error: Unsupported macOS architecture: $arch" >&2
                    return 1
                    ;;
            esac
            ;;
        Linux)
            case "$arch" in
                x86_64|amd64) echo "x86_64-unknown-linux-gnu" ;;
                aarch64|arm64) echo "aarch64-unknown-linux-gnu" ;;
                *)
                    echo "Error: Unsupported Linux architecture: $arch" >&2
                    return 1
                    ;;
            esac
            ;;
        *)
            echo "Error: Unsupported operating system: $os" >&2
            return 1
            ;;
    esac
}

# Detect package manager
# Returns: pnpm, npm, or yarn
detect_package_manager() {
    # Check lockfile first
    if [[ -f "pnpm-lock.yaml" ]]; then
        echo "pnpm"
        return 0
    elif [[ -f "yarn.lock" ]]; then
        echo "yarn"
        return 0
    elif [[ -f "package-lock.json" ]]; then
        echo "npm"
        return 0
    fi

    # Fallback to command availability
    if command -v pnpm &>/dev/null; then
        echo "pnpm"
    elif command -v yarn &>/dev/null; then
        echo "yarn"
    elif command -v npm &>/dev/null; then
        echo "npm"
    else
        echo "Error: No package manager found" >&2
        return 1
    fi
}

# Get shell profile path for PATH instructions
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

# Check if a directory is in PATH
is_in_path() {
    local dir="$1"
    if [[ ":$PATH:" == *":$dir:"* ]]; then
        return 0
    else
        return 1
    fi
}

# Version comparison (v1 >= v2)
# Returns 0 if v1 >= v2, 1 otherwise
version_ge() {
    local v1="$1"
    local v2="$2"

    # Split versions into arrays
    local IFS='.'
    read -ra V1 <<< "$v1"
    read -ra V2 <<< "$v2"

    # Compare each segment
    for i in 0 1 2; do
        local n1="${V1[$i]:-0}"
        local n2="${V2[$i]:-0}"

        if (( n1 > n2 )); then
            return 0
        elif (( n1 < n2 )); then
            return 1
        fi
    done
    return 0
}

# Check if running in CI environment
is_ci() {
    if [[ -n "${CI:-}" ]] || [[ -n "${GITHUB_ACTIONS:-}" ]] || [[ -n "${GITLAB_CI:-}" ]]; then
        return 0
    else
        return 1
    fi
}

# Get Sigil install directory
get_sigil_install_dir() {
    echo "${SIGIL_INSTALL_DIR:-$HOME/.sigil/bin}"
}
