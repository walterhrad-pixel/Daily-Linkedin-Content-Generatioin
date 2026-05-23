"""Utilities for reading codebase and documentation folders."""

from __future__ import annotations

import os
from pathlib import Path

# Roughly ~25k tokens at ~4 chars/token
DEFAULT_MAX_CHARS = 100_000

SKIP_DIR_NAMES = {
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    ".mypy_cache",
    ".pytest_cache",
    ".tox",
    "dist",
    "build",
    ".next",
    ".nuxt",
    "coverage",
    ".cursor",
    "vendor",
    ".idea",
    ".vscode",
}

TEXT_EXTENSIONS = {
    ".md",
    ".markdown",
    ".txt",
    ".rst",
    ".adoc",
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".cfg",
    ".html",
    ".htm",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".rb",
    ".php",
    ".cs",
    ".cpp",
    ".c",
    ".h",
    ".hpp",
    ".swift",
    ".sql",
    ".sh",
    ".bash",
    ".zsh",
    ".ps1",
    ".bat",
    ".env.example",
    ".dockerfile",
    "dockerfile",
    ".graphql",
    ".vue",
    ".svelte",
}


def _is_probably_binary(path: Path) -> bool:
    try:
        with path.open("rb") as f:
            chunk = f.read(8192)
    except OSError:
        return True
    if b"\x00" in chunk:
        return True
    try:
        chunk.decode("utf-8")
    except UnicodeDecodeError:
        return True
    return False


def _should_skip_dir(name: str) -> bool:
    return name in SKIP_DIR_NAMES or name.startswith(".")


def read_path_contents(
    root: str | Path,
    *,
    max_chars: int = DEFAULT_MAX_CHARS,
) -> str:
    """Read text from files under *root*, skipping binaries and common junk dirs."""
    root_path = Path(root).resolve()
    if not root_path.exists():
        raise FileNotFoundError(f"Path does not exist: {root_path}")
    if not root_path.is_dir():
        raise NotADirectoryError(f"Expected a directory: {root_path}")

    sections: list[str] = []
    total_chars = 0
    truncated = False

    for dirpath, dirnames, filenames in os.walk(root_path):
        dirnames[:] = [d for d in dirnames if not _should_skip_dir(d)]

        for filename in sorted(filenames):
            if total_chars >= max_chars:
                truncated = True
                break

            file_path = Path(dirpath) / filename
            ext = file_path.suffix.lower()
            name_lower = filename.lower()

            if ext not in TEXT_EXTENSIONS and name_lower not in {
                "dockerfile",
                "makefile",
                "readme",
                "license",
                "changelog",
            }:
                continue

            if _is_probably_binary(file_path):
                continue

            try:
                text = file_path.read_text(encoding="utf-8")
            except (OSError, UnicodeDecodeError):
                continue

            rel = file_path.relative_to(root_path).as_posix()
            header = f"\n\n--- FILE: {rel} ---\n"
            block = header + text.strip()

            remaining = max_chars - total_chars
            if len(block) > remaining:
                block = block[:remaining] + "\n\n[... truncated ...]"
                sections.append(block)
                total_chars += len(block)
                truncated = True
                break

            sections.append(block)
            total_chars += len(block)

        if truncated:
            break

    if not sections:
        return ""

    body = "".join(sections)
    if truncated:
        body += "\n\n[Note: source material was truncated to fit context limits.]"
    return body.strip()
