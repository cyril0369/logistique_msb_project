#!/usr/bin/env bash

set -u

OSH_DIR="${OSH:-$HOME/.oh-my-bash}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-5}"

if [[ ! -d "$OSH_DIR" ]]; then
  echo "Oh My Bash directory not found: $OSH_DIR"
  exit 1
fi

if [[ ! -f "$OSH_DIR/oh-my-bash.sh" ]]; then
  echo "Missing loader script: $OSH_DIR/oh-my-bash.sh"
  exit 1
fi

if [[ ! -d "$OSH_DIR/themes" ]]; then
  echo "Themes directory not found: $OSH_DIR/themes"
  exit 1
fi

mapfile -t THEME_FILES < <(find "$OSH_DIR/themes" -type f -name '*.theme.sh' | sort)

if [[ ${#THEME_FILES[@]} -eq 0 ]]; then
  echo "No theme files found under: $OSH_DIR/themes"
  exit 1
fi

pass_count=0
fail_count=0
tested_count=0
failed_themes=()

echo "Found ${#THEME_FILES[@]} themes. Running tests..."

for file in "${THEME_FILES[@]}"; do
  rel="${file#"$OSH_DIR/themes/"}"
  theme_name="${rel%.theme.sh}"
  ((tested_count += 1))

  err_file="$(mktemp)"

  # Run each theme in a clean interactive shell to catch theme init/runtime errors.
  if timeout "${TIMEOUT_SECONDS}s" env -i \
    HOME="$HOME" \
    PATH="$PATH" \
    TERM="${TERM:-xterm-256color}" \
    USER="${USER:-user}" \
    SHELL="${SHELL:-/bin/bash}" \
    OSH="$OSH_DIR" \
    OMB_THEME="$theme_name" \
    bash --noprofile --norc -i -c 'source "$OSH/oh-my-bash.sh" >/dev/null' 2>"$err_file"
  then
    echo "[PASS] $theme_name"
    ((pass_count += 1))
  else
    exit_code=$?
    echo "[FAIL] $theme_name (exit $exit_code)"
    if [[ -s "$err_file" ]]; then
      head -n 2 "$err_file" | sed 's/^/       /'
    fi
    failed_themes+=("$theme_name")
    ((fail_count += 1))
  fi

  rm -f "$err_file"
done

echo
echo "Summary: tested=$tested_count, passed=$pass_count, failed=$fail_count"

if [[ $fail_count -gt 0 ]]; then
  echo "Failed themes:"
  printf ' - %s\n' "${failed_themes[@]}"
  exit 2
fi

exit 0