const fs = require("fs");
const { parse } = require("fast-csv");
const bulmaCss = fs
	.readFileSync("node_modules/bulma/css/bulma.min.css")
	.toString();

const titleField = "What is your name?";
const subtitleField = "Username";

const questionFactory = (question, answer) => {
	const html = `
    <div class="field">
        <p class="has-text-weight-bold">${question}</p>
        <p>${answer || "[no answer]"}</p>
    </div>`;
	return html;
};

const cardFactory = (row) => {
	let html = `<div class="box">`;
	if (titleField) {
		html += `<h2 class="title">${row[titleField]}</h2>`;
	}
	if (subtitleField) {
		html += `<div class="subtitle">${row[subtitleField]}</div>`;
	}
	Object.keys(row).forEach((question) => {
		if (question === titleField || question === subtitleField) {
			return null;
		}
		const answer = row[question];
		html += questionFactory(question, answer);
		return null;
	});
	html += `</div>`;
	return html;
};

const finalizeHtml = (htmlContent) => {
	const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            ${bulmaCss}
            .box {
                padding: 30px;
                box-shadow: 0px 5px 10px rgba(0,0,0,0.10);
                border: 1px solid #d1d1d1;
            }
        </style>
    </head>
    <body>
        ${htmlContent}
    </body>
    </html>`;
	return fs.writeFileSync("results.html", html);
};

const generateHtmlFromCsv = (filePath, title = null) => {
	let htmlContent = ``;
	fs.createReadStream(filePath)
		.pipe(parse({ headers: true }))
		.on("error", (error) => {
			console.error(error);
		})
		.on("data", (row) => {
			htmlContent += `<div class="column is-full">${cardFactory(
				row
			)}</div>`;
		})
		.on("end", (rowCount) => {
			const htmlContentWrapper = `
        <section class="section">
        <div class="container" style="max-width: 800px">
            <h1 class="title is-size-1 has-text-centered" style="margin-bottom: 4rem;">${title}</h1>
            <div class="columns is-multiline">
                ${htmlContent}
            </div>
        </div>
        </section>
        `;
			finalizeHtml(htmlContentWrapper);
		});
};

generateHtmlFromCsv("responses.csv", "Leadership Training Day 1 Responses");
