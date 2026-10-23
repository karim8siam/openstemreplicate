"""Validate generated sitemap XML and the index's local child sitemaps."""

from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


def read_sitemap(file, allowed_roots):
    try:
        root = ET.parse(file).getroot()
    except (OSError, ET.ParseError) as error:
        raise ValueError(f"{file.name}: {error}") from error
    if root.tag not in {NS + name for name in allowed_roots}:
        raise ValueError(f"{file.name}: expected sitemap namespace and {allowed_roots}")
    entry_tag = NS + ("sitemap" if root.tag == NS + "sitemapindex" else "url")
    if not len(root) or any(entry.tag != entry_tag for entry in root):
        raise ValueError(f"{file.name}: empty sitemap or unexpected entries")
    locations = []
    for entry in root:
        loc = entry.findall(NS + "loc")
        if len(loc) != 1 or len(loc[0]) or not (loc[0].text or "").strip():
            raise ValueError(f"{file.name}: each entry needs exactly one nonempty loc")
        locations.append(loc[0].text.strip())
    if len(set(locations)) != len(locations):
        raise ValueError(f"{file.name}: duplicate locations")
    return root.tag, locations


def verify_sitemaps(directory):
    directory = Path(directory).resolve()
    directives = [
        line.split(":", 1)[1].strip()
        for line in (directory / "robots.txt").read_text(encoding="utf-8").splitlines()
        if line.strip().lower().startswith("sitemap:")
    ]
    masters = [url for url in directives if url.endswith("/sitemap.xml")]
    if len(masters) != 1:
        raise ValueError("robots.txt must advertise exactly one sitemap.xml")
    base_url = masters[0][:-len("sitemap.xml")]

    def local_path(url):
        parsed = urlsplit(url)
        if (parsed.scheme != "https" or not parsed.netloc or parsed.username
                or parsed.password or parsed.query or parsed.fragment
                or not url.startswith(base_url)):
            raise ValueError(f"Expected an absolute canonical HTTPS URL under {base_url}: {url}")
        file = (directory / unquote(url[len(base_url):])).resolve()
        if not file.is_relative_to(directory):
            raise ValueError(f"Sitemap path escapes the build directory: {url}")
        return file

    local_path(masters[0])
    root_tag, locations = read_sitemap(directory / "sitemap.xml", ("sitemapindex", "urlset"))
    pages = []
    if root_tag == NS + "sitemapindex":
        for url in locations:
            _, child_pages = read_sitemap(local_path(url), ("urlset",))
            pages.extend(child_pages)
    else:
        pages = locations
    for url in pages:
        local_path(url)

    _, all_pages = read_sitemap(directory / "sitemap-all.xml", ("urlset",))
    for url in all_pages:
        local_path(url)
    if set(pages) != set(all_pages):
        raise ValueError("sitemap.xml coverage must match sitemap-all.xml")
    child_count = len(locations) if root_tag == NS + "sitemapindex" else 0
    return child_count, len(set(pages))


if __name__ == "__main__":
    try:
        children, urls = verify_sitemaps(Path(__file__).resolve().parent.parent)
    except (OSError, ValueError) as error:
        sys.exit(f"Sitemap validation failed: {error}")
    print(f"Validated {children} child sitemaps and {urls} URLs; sitemap-all.xml matches.")
