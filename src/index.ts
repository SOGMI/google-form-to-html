import {
  createReadStream,
  ensureFile,
  readFileSync,
  writeFile,
} from "fs-extra";
import path from "path";
import { parse } from "fast-csv";
import { execSync } from "child_process";

// generate css file
execSync("npm run compile-css");

// get css file contents
const css = readFileSync("./.temp/styles.css").toString();

type FieldType = "short-text" | "long-text" | "date";

interface FieldConfig {
  key: string;
  type: FieldType;
  fallbackValue?: string;
}

interface Config {
  input: string;
  output: string;
  title: string;
  subtitle: string;
  titleField: string;
  subtitleField: string;
  otherFields: FieldConfig[];
}

const getConfig = () => {
  const rootDir = path.resolve("./csv.config.js");
  const config = require(rootDir);
  return config as Config;
};

interface Row {
  [key: string]: string;
}

const cardGenerator = (row: Row, config: Config): string => {
  let innerHtml = "";

  const title = row[config.titleField];
  const subtitle = row[config.subtitleField];
  if (title || subtitle) {
    innerHtml += `<div class="mb-4">\n`;
    if (title) innerHtml += `<h2 class="font-bold text-2xl">${title}</h2>`;
    if (subtitle) innerHtml += `<p class="text-xl">${subtitle}</p>`;
  }

  for (const field of config.otherFields) {
    const value = row[field.key];
    if (value) {
      let fieldInnerHtml = ``;
      switch (field.type) {
        case "short-text":
          fieldInnerHtml = `<p><strong>${field.key}</strong></p>
          <div>${value}</div>`;
          break;
        case "long-text":
          fieldInnerHtml = `<p><strong>${field.key}</strong></p>
                    <div>${value}</div>`;
          break;
        default:
          break;
      }
      innerHtml += `
                    <div class="my-4">${fieldInnerHtml}</div>
                    `;
    } else if (field.fallbackValue) {
      innerHtml += `
        <div class="my-4">
            <p><strong>${field.key}</strong></p>
            <div>${field.fallbackValue}</div>
        </div>`;
    }
  }

  const html = `<article class="p-4 w-full">
        <div class="p-4 bg-white border border-gray-300 shadow rounded">
            ${innerHtml}
        </div>
    </article>`;
  return html;
};

const renderHtml = async (rows: Row[], config: Config) => {
  let titleHtml = ``;
  if (config.title || config.subtitle) {
    titleHtml += `<div class="mb-10 text-center">`;
    if (config.title) {
      titleHtml += `<h1 class="text-4xl font-bold">${config.title}</h1>`;
    }
    if (config.subtitle) {
      titleHtml += `<div class="text-2xl font-bold">${config.subtitle}</div>`;
    }
    titleHtml += `</div>`;
  }
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        ${css}
    </style>
</head>
<body class="text-gray-700">
    <section class="py-20 px-10">
        <div class="mx-auto relative container" style="max-width: 700px !important">
                ${titleHtml}
        <div class="flex flex-wrap -m-4">
                ${csvRowsToHtml(rows, config)}
            </div>
        </div>
    </section>
</body>
</html>`;
  await ensureFile(config.output);
  return writeFile(config.output, html);
};

const csvRowsToHtml = (rows: Row[], config: Config) => {
  const cards: string[] = [];
  for (const row of rows) {
    cards.push(cardGenerator(row, config));
  }
  let html = "";
  for (const card of cards) {
    html += card;
  }
  return html;
};

const generateHtmlFromCsv = (config: Config) => {
  const rows: Row[] = [];
  createReadStream(path.resolve(config.input))
    .pipe(parse({ headers: true }))
    .on("error", (err: any) => {
      throw err;
    })
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", () => {
      return renderHtml(rows, config);
    });
};

const config = getConfig();
generateHtmlFromCsv(config);
