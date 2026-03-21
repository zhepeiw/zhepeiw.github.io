from __future__ import annotations

import io
import json
from pathlib import Path

import fitz
import requests
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLICATIONS_PATH = ROOT / "src/generated/publications.json"
MEDIA_PATH = ROOT / "src/generated/publication-media.json"
CACHE_DIR = ROOT / ".cache/publication-pdfs"
OUTPUT_DIR = ROOT / "public/assets/publications"
TARGET_CATEGORIES = {"Peer-Reviewed Articles", "Preprints"}
CANVAS_SIZE = (1600, 900)
BG_COLOR = "#f7f4ee"


def download_pdf(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36"
        )
    }
    response = requests.get(url, headers=headers, timeout=60)
    response.raise_for_status()
    destination.write_bytes(response.content)


def extract_best_image(document: fitz.Document) -> Image.Image | None:
    best_image = None
    best_area = 0
    pages = min(8, len(document))

    for page_index in range(pages):
      page = document.load_page(page_index)
      for image_info in page.get_images(full=True):
        xref = image_info[0]
        extracted = document.extract_image(xref)
        image_bytes = extracted.get("image")
        if not image_bytes:
          continue
        try:
          image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception:
          continue
        width, height = image.size
        area = width * height
        aspect = width / max(height, 1)
        if area < 120_000 or aspect < 0.45 or aspect > 3.8:
          continue
        if area > best_area:
          best_area = area
          best_image = image

    return best_image


def render_first_page(document: fitz.Document) -> Image.Image:
    page = document.load_page(0)
    pix = page.get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False)
    return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)


def to_landscape_thumbnail(image: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", CANVAS_SIZE, BG_COLOR)
    fitted = ImageOps.contain(image, CANVAS_SIZE)
    offset = ((CANVAS_SIZE[0] - fitted.width) // 2, (CANVAS_SIZE[1] - fitted.height) // 2)
    canvas.paste(fitted, offset)
    return canvas


def main() -> None:
    publications = json.loads(PUBLICATIONS_PATH.read_text())
    existing = json.loads(MEDIA_PATH.read_text()) if MEDIA_PATH.exists() else {}
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    media = {}
    for publication in publications:
        if publication["category"] not in TARGET_CATEGORIES:
            continue
        pdf_url = publication.get("pdf")
        if not pdf_url:
            continue

        pdf_path = CACHE_DIR / f'{publication["id"]}.pdf'
        if not pdf_path.exists():
            print(f"Downloading {publication['id']}")
            download_pdf(pdf_url, pdf_path)

        document = fitz.open(pdf_path)
        image = extract_best_image(document)
        if image is None:
            image = render_first_page(document)

        thumbnail = to_landscape_thumbnail(image)
        output_path = OUTPUT_DIR / f'{publication["id"]}.jpg'
        thumbnail.save(output_path, quality=88)

        previous = existing.get(publication["id"], {})
        media[publication["id"]] = {
            "image": f"/assets/publications/{publication['id']}.jpg",
            "imageAlt": previous.get(
                "imageAlt",
                f"Representative figure for {publication['title']}",
            ),
            "imageSource": previous.get("imageSource", "Extracted from paper PDF"),
            "summary": previous.get("summary"),
        }

    MEDIA_PATH.write_text(json.dumps(media, indent=2) + "\n")


if __name__ == "__main__":
    main()
