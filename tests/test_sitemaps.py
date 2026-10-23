from pathlib import Path
import tempfile
import unittest

from scripts.verify_sitemaps import verify_sitemaps


BASE = "https://openstemreplicate.org/"
NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"


def xml(root, urls):
    entry = "sitemap" if root == "sitemapindex" else "url"
    return (f'<?xml version="1.0"?><{root} xmlns="{NAMESPACE}">'
            + "".join(f"<{entry}><loc>{url}</loc></{entry}>" for url in urls)
            + f"</{root}>")


class SitemapValidationTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.write("robots.txt", f"User-agent: *\nSitemap: {BASE}sitemap.xml\n")
        self.write("sitemap.xml", xml("sitemapindex", [BASE + "sitemap-main.xml"]))
        self.write("sitemap-main.xml", xml("urlset", [BASE]))
        self.write("sitemap-all.xml", xml("urlset", [BASE]))

    def write(self, name, content):
        (self.root / name).write_text(content, encoding="utf-8")

    def test_accepts_sitemap_index_and_resolves_every_child(self):
        self.write("sitemap.xml", xml("sitemapindex", [
            BASE + "sitemap-main.xml", BASE + "sitemap-month.xml",
        ]))
        self.write("sitemap-month.xml", xml("urlset", [BASE + "research/paper/"]))
        self.write("sitemap-all.xml", xml("urlset", [BASE, BASE + "research/paper/"]))
        self.assertEqual(verify_sitemaps(self.root), (2, 2))

    def test_accepts_legacy_urlset(self):
        self.write("sitemap.xml", xml("urlset", [BASE]))
        self.assertEqual(verify_sitemaps(self.root), (0, 1))

    def test_rejects_missing_child(self):
        (self.root / "sitemap-main.xml").unlink()
        with self.assertRaisesRegex(ValueError, "sitemap-main.xml"):
            verify_sitemaps(self.root)

    def test_rejects_invalid_xml_and_structure_in_root_or_child(self):
        for file, valid_root in [("sitemap.xml", "sitemapindex"), ("sitemap-main.xml", "urlset")]:
            original = (self.root / file).read_text(encoding="utf-8")
            for invalid in [
                f'<{valid_root} xmlns="{NAMESPACE}">',  # Truncated XML.
                xml(valid_root, []),
                '<html><!-- <urlset -->not a sitemap</html>',
                xml(valid_root, [BASE]).replace(NAMESPACE, "https://invalid.example/xml"),
                f'<{valid_root} xmlns="{NAMESPACE}"><url/></{valid_root}>',
            ]:
                with self.subTest(file=file, invalid=invalid):
                    self.write(file, invalid)
                    with self.assertRaises(ValueError):
                        verify_sitemaps(self.root)
            self.write(file, original)

    def test_rejects_external_relative_and_escaping_child_locations(self):
        for url in ["sitemap-main.xml", "https://other.example/sitemap.xml",
                    "http://openstemreplicate.org/sitemap.xml", BASE + "%2e%2e/sitemap.xml",
                    BASE + "sitemap-main.xml?x=1", BASE + "sitemap-main.xml#fragment"]:
            with self.subTest(url=url):
                self.write("sitemap.xml", xml("sitemapindex", [url]))
                with self.assertRaises(ValueError):
                    verify_sitemaps(self.root)

    def test_rejects_invalid_page_locations_even_when_all_sitemaps_agree(self):
        for url in ["/research/paper/", "https://other.example/research/paper/"]:
            with self.subTest(url=url):
                self.write("sitemap-main.xml", xml("urlset", [url]))
                self.write("sitemap-all.xml", xml("urlset", [url]))
                with self.assertRaises(ValueError):
                    verify_sitemaps(self.root)

    def test_rejects_missing_coverage_and_invalid_consolidated_sitemap(self):
        for content in [xml("urlset", [BASE + "missing/"]),
                        xml("urlset", []), '<urlset', xml("sitemapindex", [BASE])]:
            with self.subTest(content=content):
                self.write("sitemap-all.xml", content)
                with self.assertRaises(ValueError):
                    verify_sitemaps(self.root)

    def test_rejects_duplicate_child_references(self):
        self.write("sitemap.xml", xml("sitemapindex", [BASE + "sitemap-main.xml"] * 2))
        with self.assertRaisesRegex(ValueError, "duplicate"):
            verify_sitemaps(self.root)

    def test_rejects_missing_master_robots_directive(self):
        self.write("robots.txt", f"Sitemap: {BASE}sitemap-all.xml\n")
        with self.assertRaisesRegex(ValueError, "robots.txt"):
            verify_sitemaps(self.root)
