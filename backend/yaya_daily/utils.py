"""Utilities for reading uploaded document files."""

from __future__ import annotations

from pathlib import Path

# Roughly ~25k tokens at ~4 chars/token
DEFAULT_MAX_CHARS = 100_000


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


def read_file_contents(
    file_path: str | Path,
    *,
    max_chars: int = DEFAULT_MAX_CHARS,
) -> str:
    """Read text from a single uploaded or local file."""
    path = Path(file_path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"File does not exist: {path}")
    if not path.is_file():
        raise IsADirectoryError(f"Expected a file, not a directory: {path}")
    if _is_probably_binary(path):
        raise ValueError(f"File does not appear to be text: {path.name}")

    text = path.read_text(encoding="utf-8").strip()
    header = f"--- FILE: {path.name} ---\n"
    block = header + text
    if len(block) > max_chars:
        block = block[:max_chars] + "\n\n[... truncated ...]"
        block += "\n\n[Note: source material was truncated to fit context limits.]"
    return block.strip()
