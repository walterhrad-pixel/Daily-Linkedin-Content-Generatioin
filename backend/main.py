import argparse
import asyncio

from dotenv import load_dotenv

from yaya_daily.agent import root_agent
from yaya_daily.utils import read_path_contents


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

## Source Material (codebase / documentation)
{source_material if source_material.strip() else "[No readable text files were found at the given path.]"}

---

Use the source material above as your only factual basis. Identify a concrete feature, update, or value proposition worth promoting, then pass structured context through the pipeline so each downstream agent keeps the product name and highlighted feature intact.
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Daily Content Generator — marketing content from any codebase or docs folder.",
    )
    parser.add_argument(
        "--path",
        required=True,
        help="Path to a codebase or documentation folder to analyze.",
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
    return parser.parse_args()


async def main() -> None:
    load_dotenv()
    args = parse_args()

    print("Starting SequentialAgent: DailyContentOrchestrator")
    print("Pipeline: Miner -> Ghostwriter -> Humanizer\n")
    print(f"Reading source material from: {args.path}")

    source_material = read_path_contents(args.path)
    file_count_hint = source_material.count("--- FILE:")
    print(f"Loaded {file_count_hint} text file(s) into context.\n")

    format_map = {
        "linkedin": "LinkedIn post",
        "twitter": "Twitter thread",
        "blog": "blog intro",
    }
    content_format = format_map.get(args.format) if args.format else None

    initial_prompt = build_initial_prompt(
        product_name=args.product_name,
        audience=args.audience,
        source_material=source_material,
        content_format=content_format,
    )

    response = await root_agent.run_async(initial_prompt)

    print("\n--- Final Marketing Content ---")
    print(response.content)
    print("-------------------------------\n")
    print("Daily Content Generator completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())
