import argparse
import asyncio
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

from yaya_daily.agent import root_agent
from yaya_daily.config import ensure_api_key
from yaya_daily.utils import read_file_contents

_BACKEND_DIR = Path(__file__).resolve().parent


def _load_env() -> None:
    load_dotenv(_BACKEND_DIR / ".env")
    load_dotenv(_BACKEND_DIR / "yaya_daily" / ".env")


def build_initial_prompt(
    *,
    product_name: str,
    audience: str,
    source_material: str,
    content_format: str | None = None,
) -> str:
    format_line = (
        f"\nPreferred content format (if specified): {content_format}"
        if content_format
        else "\nContent format: let the Ghostwriter choose the best fit (LinkedIn post, Twitter thread, or blog intro)."
    )

    return f"""# Daily Content Generation Task

## Product
{product_name}

## Target Audience
{audience}
{format_line}

## Source Material (uploaded file / documentation)
{source_material if source_material.strip() else "[No readable source text was provided.]"}

---

Use the source material above as your only factual basis. Identify a concrete feature, update, or value proposition worth promoting, then pass structured context through the pipeline so each downstream agent keeps the product name and highlighted feature intact.
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Daily Content Generator — marketing content from any document file.",
    )
    parser.add_argument(
        "--file",
        required=True,
        help="Path to a single text file (e.g. README, changelog, notes).",
    )
    parser.add_argument(
        "--product-name",
        required=True,
        help="Name of the product to promote in the generated content.",
    )
    parser.add_argument(
        "--audience",
        required=True,
        help="Target audience for the marketing content (e.g., 'startup founders', 'DevOps engineers').",
    )
    parser.add_argument(
        "--format",
        choices=["linkedin", "twitter", "blog"],
        default=None,
        help="Optional preferred output format.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print the final content as a JSON object on stdout (for API integrations).",
    )
    return parser.parse_args()


def _format_map() -> dict[str, str]:
    return {
        "linkedin": "LinkedIn post",
        "twitter": "Twitter thread",
        "blog": "blog intro",
    }


def _load_source_material(*, file: str) -> str:
    return read_file_contents(file)


async def generate_content(
    *,
    product_name: str,
    audience: str,
    content_format: str | None = None,
    file: str,
) -> str:
    """Run the Miner -> Ghostwriter -> Humanizer pipeline and return final text."""
    _load_env()
    ensure_api_key()

    source_material = _load_source_material(file=file)
    initial_prompt = build_initial_prompt(
        product_name=product_name,
        audience=audience,
        source_material=source_material,
        content_format=content_format,
    )

    response = await root_agent.run_async(initial_prompt)
    return str(response.content)


async def main() -> None:
    args = parse_args()
    format_map = _format_map()
    content_format = format_map.get(args.format) if args.format else None

    if not args.json:
        print("Starting SequentialAgent: DailyContentOrchestrator")
        print("Pipeline: Miner -> Ghostwriter -> Humanizer")
        print(f"Reading source material from: {args.file}\n")

    try:
        final = await generate_content(
            file=args.file,
            product_name=args.product_name,
            audience=args.audience,
            content_format=content_format,
        )
    except Exception as exc:
        if args.json:
            print(json.dumps({"ok": False, "error": str(exc)}))
            sys.exit(1)
        raise

    if args.json:
        print(json.dumps({"ok": True, "content": final}))
    else:
        print("\n--- Final Marketing Content ---")
        print(final)
        print("-------------------------------\n")
        print("Daily Content Generator completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())
