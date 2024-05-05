/**
 * This script reads DMARC report XML files and outputs a table to the console.
 *
 * Usage: node dmarc-reporter.js file1.xml file2.xml ...
 *        node dmarc-reporter.js *.xml
 *
 * How to setup: (requires Node.js)
 *
 * 1. Create a directory and save this script to a file named dmarc-reporter.js.
 * 2. Save your DMARC report XML files to the same directory.
 * 3. Open a terminal and navigate to the directory.
 * 4. Run "npm install table xml2js" to install the required packages.
 * 5. Run the script with the command: node dmarc-reporter.js file1.xml file2.xml ...
 *
 */
const fs = require("fs"),
  table = require("table"),
  xml2js = require("xml2js");

const parser = new xml2js.Parser({ explicitArray: false });

// Set color for pass/fail text.
const setTextColor = function (text) {
  if (text === "pass") {
    return "\x1b[32m" + text + "\x1b[0m";
  } else if (text === "fail") {
    return "\x1b[31m" + text + "\x1b[0m";
  }
};

// Parse a single file.
const parseFile = async function (fileName) {
  const data = await fs.promises.readFile(fileName);
  let json = await parser.parseStringPromise(data);
  json = json.feedback;

  const reporter = json.report_metadata.org_name;
  const startDate = new Date(parseInt(json.report_metadata.date_range.begin) * 1000);
  const endDate = new Date(parseInt(json.report_metadata.date_range.end) * 1000);
  if (!Array.isArray(json.record)) {
    json.record = [json.record];
  }
  const record = json.record.map((r) => {
    return [
      r.row.source_ip,
      r.row.count,
      setTextColor(r.row.policy_evaluated.spf),
      r.auth_results.spf.domain || "",
      setTextColor(r.row.policy_evaluated.dkim),
      Array.isArray(r.auth_results.dkim)
        ? r.auth_results.dkim.map((x) => x.selector || "").join(", ")
        : r.auth_results.dkim?.selector || "",
      r.identifiers.header_from || "",
      r.identifiers.envelope_from || "",
      r.identifiers.envelope_to || "",
      reporter,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ];
  });
  return record;
};

const parseFiles = async function (fileNames) {
  let records = [];
  for (let fileName of fileNames) {
    let record = await parseFile(fileName);
    records = records.concat(record);
  }

  // Sort by start date.
  records.sort((a, b) => {
    return a[a.length-2].localeCompare(b[b.length-2]);
  });

  // Add header.
  records.unshift([
    "Source IP",
    "Count",
    "SPF",
    "SPF Domain",
    "DKIM",
    "DKIM Selector",
    "Header From",
    "Envelope From",
    "Envelope To",
    "Reporter",
    "Start Date",
    "End Date",
  ]);

  // Output the table to the console.
  console.log(
    table.table(records, { border: table.getBorderCharacters("norc") })
  );
  return records;
};

// Run it!
parseFiles(process.argv.slice(2));
