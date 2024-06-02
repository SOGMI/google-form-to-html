# CSV To PDF

Simple tool that can take a csv file and convert it to PDF for easy printing.

## Prerequisites

Install the latest version of nodejs

Install npm dependencies

```
npm install
```

Install wkhtmltopdf

## Usage

### Create Your Config File

Create a config file in the root directory named `csv.config.js`

Example config:

```js
module.exports = {
  input: "./path-to-csv.csv",
  output: "./path-to-output.pdf",
  title: "Optional title to go at the top",
  subtitle: "Optional Subtitle to go at the top",
  titleField: "The title for each card",
  subtitleField: "The subtitle for each card",
  otherFields: [
    {
      key: "My first field name",
      type: "short-text",
      fallbackValue: "[left blank]",
    },
    {
      key: "My second field name",
      type: "long-text",
      fallbackValue: "[left blank]",
    },
  ],
};
```

### Run The Command

```
npm start
```

### Open The Generated HTML File in Chrome

After you run `npm start` just open the new file in chrome and hit print.
