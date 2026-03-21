import fs from "node:fs/promises";
import path from "node:path";
import bibtexParse from "bibtex-parse-js";

const root = process.cwd();
const bibPath = path.join(root, "_bibliography", "papers.bib");
const generatedDir = path.join(root, "src", "generated");
const downloadsDir = path.join(root, "public", "downloads", "bibtex");
const mediaPath = path.join(generatedDir, "publication-media.json");

function readStringField(entry, key) {
  return entry.entryTags[key] ?? "";
}

function splitAuthors(raw) {
  return raw
    .split(/\s+and\s+/)
    .map((author) => author.replace(/[{}]/g, "").trim())
    .filter(Boolean);
}

function cleanText(value) {
  return value.replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
}

function categoryRank(category) {
  const ranks = {
    Thesis: 0,
    "Peer-Reviewed Articles": 1,
    Preprints: 2,
    "Patents and Patent Applications": 3,
    Reports: 4
  };
  return ranks[category] ?? 99;
}

const rawBib = await fs.readFile(bibPath, "utf8");
const media = JSON.parse(await fs.readFile(mediaPath, "utf8"));
const entries = bibtexParse.toJSON(rawBib);

await fs.mkdir(downloadsDir, { recursive: true });
await fs.mkdir(generatedDir, { recursive: true });

const publications = entries
  .filter((entry) => readStringField(entry, "title"))
  .map((entry) => {
    const id = entry.citationKey;
    const category = readStringField(entry, "pub");
    const year = Number.parseInt(readStringField(entry, "year"), 10);
    const venue = cleanText(readStringField(entry, "journal") || readStringField(entry, "booktitle") || "");
    const bibtex = `@${entry.entryType}{${id},\n${Object.entries(entry.entryTags)
      .map(([key, value]) => `  ${key} = {${value}}`)
      .join(",\n")}\n}\n`;
    const bibFile = `${id}.bib`;
    const bibtexDownloadPath = `/downloads/bibtex/${bibFile}`;
    return {
      id,
      title: cleanText(readStringField(entry, "title")),
      authors: splitAuthors(readStringField(entry, "author")),
      year,
      venue,
      category,
      featured: readStringField(entry, "display_select") === "1",
      summary: media[id]?.summary,
      image: media[id]?.image,
      imageAlt: media[id]?.imageAlt,
      imageSource: media[id]?.imageSource,
      imagePosition: media[id]?.imagePosition,
      imageScale: media[id]?.imageScale,
      imageFit: media[id]?.imageFit,
      pdf: readStringField(entry, "pdf") || undefined,
      html: readStringField(entry, "html") || undefined,
      video: readStringField(entry, "video") || undefined,
      slides: readStringField(entry, "slides") || undefined,
      poster: readStringField(entry, "poster") || undefined,
      code: readStringField(entry, "code") || undefined,
      audio: readStringField(entry, "audio") || undefined,
      url: readStringField(entry, "url") || undefined,
      bibtex,
      bibtexDownloadPath
    };
  })
  .sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (categoryRank(a.category) !== categoryRank(b.category)) {
      return categoryRank(a.category) - categoryRank(b.category);
    }
    return a.title.localeCompare(b.title);
  });

await Promise.all(
  publications.map((publication) =>
    fs.writeFile(path.join(downloadsDir, `${publication.id}.bib`), publication.bibtex, "utf8")
  )
);

await fs.writeFile(path.join(generatedDir, "publications.json"), JSON.stringify(publications, null, 2) + "\n");
