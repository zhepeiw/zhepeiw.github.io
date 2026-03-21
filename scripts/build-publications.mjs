import fs from "node:fs/promises";
import path from "node:path";
import bibtexParse from "bibtex-parse-js";

const root = process.cwd();
const bibPath = path.join(root, "_bibliography", "papers.bib");
const generatedDir = path.join(root, "src", "generated");
const mediaPath = path.join(generatedDir, "publication-media.json");

const standardBibtexFields = [
  "address",
  "author",
  "booktitle",
  "chapter",
  "doi",
  "edition",
  "editor",
  "howpublished",
  "institution",
  "journal",
  "month",
  "note",
  "number",
  "organization",
  "pages",
  "publisher",
  "school",
  "series",
  "title",
  "type",
  "url",
  "volume",
  "year"
];
const standardBibtexFieldSet = new Set(standardBibtexFields);

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

function buildBibtex(entry) {
  const normalizedTags = Object.entries(entry.entryTags).reduce((acc, [key, value]) => {
    if (!standardBibtexFieldSet.has(key)) return acc;
    acc[key] = value.trim();
    return acc;
  }, {});

  return `@${entry.entryType}{${entry.citationKey},\n${Object.entries(normalizedTags)
    .map(([key, value]) => `  ${key} = {${value}}`)
    .join(",\n")}\n}\n`;
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

await fs.mkdir(generatedDir, { recursive: true });

const publications = entries
  .filter((entry) => readStringField(entry, "title"))
  .map((entry) => {
    const id = entry.citationKey;
    const category = readStringField(entry, "pub");
    const year = Number.parseInt(readStringField(entry, "year"), 10);
    const venue = cleanText(readStringField(entry, "journal") || readStringField(entry, "booktitle") || "");
    const bibtex = buildBibtex(entry);
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
      bibtex
    };
  })
  .sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (categoryRank(a.category) !== categoryRank(b.category)) {
      return categoryRank(a.category) - categoryRank(b.category);
    }
    return a.title.localeCompare(b.title);
  });

await fs.writeFile(path.join(generatedDir, "publications.json"), JSON.stringify(publications, null, 2) + "\n");
