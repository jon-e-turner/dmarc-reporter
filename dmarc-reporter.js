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
import { promises } from "fs";
import { table, getBorderCharacters } from "table";
import { Parser } from "xml2js";
import getopts from "getopts";

const opts = {
  alias: {
    border: ["b", "B"],
    color: ["c", "C"],
    failed: ["F"],
    help: ["h", "H", "?"]
  },
  default: {
    border: true,
    color: true,
    failed: false,
    help: false
  }
};

const parser = new Parser({ explicitArray: false });

// Set color for pass/fail text.
const setTextColor = function (text) {
  if (text === "pass") {
    return "\x1b[32m" + text + "\x1b[0m";
  } else if (text === "fail") {
    return "\x1b[31m" + text + "\x1b[0m";
  }
};

const usage = function () {
  console.log("Usage: node dmarc-reporter.js [--[no-]border] [--[no-]color] [--failed] file1.xml file2.xml");
  console.log("       node dmarc-reporter.js [--[no-]border] [--[no-]color] [--failed] *.xml");
  return;
}

// Parse a single file.
const parseFile = async function (fileName, color = true, failed = false) {
  const data = await promises.readFile(fileName);
  let json = await parser.parseStringPromise(data);
  json = json.feedback;

  const reporter = json.report_metadata.org_name;
  const startDate = new Date(parseInt(json.report_metadata.date_range.begin) * 1000);
  const endDate = new Date(parseInt(json.report_metadata.date_range.end) * 1000);

  if (!Array.isArray(json.record)) {
    json.record = [json.record];
  }

  const record = json.record.map((r) => {
    if (!failed || (r.row.policy_evaluated.spf === "fail" && r.row.policy_evaluated.dkim === "fail")) {
      return [
        r.row.source_ip,
        r.row.count,
        color
          ? setTextColor(r.row.policy_evaluated.spf)
          : r.row.policy_evaluated.spf,
        r.auth_results.spf.domain || "",
        color
          ? setTextColor(r.row.policy_evaluated.dkim)
          : r.row.policy_evaluated.dkim,
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
    }
  });

  return record.filter((x) => x !== undefined);
};

const parseFiles = async function (fileNames, color = true, border = true, failed = false) {
  let records = [];
  for (let fileName of fileNames) {
    let record = await parseFile(fileName, color, failed);
    records = records.concat(record);
  }

  // Sort by start date.
  records.sort((a, b) => {
    return a[a.length - 2].localeCompare(b[b.length - 2]);
  });

  // Add header.
  if (border) {
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
  }
  // Output the table to the console.
  if (records.length > 0) {
    console.log(
      border ?
        table(records, { border: getBorderCharacters('norc') }) :
        table(records, {
          border: getBorderCharacters('void'),
          columnDefault: {
            paddingLeft: 0,
            paddingRight: 1,
            alignment: 'left'
          },
          drawHorizontalLine: () => false
        })
    );
  }

  return records;
};

const main = async function (args) {
  const options = getopts(args, opts);

  if (options.help || options._ === undefined || options._.length == 0) {
    usage();
    return;
  }

  return await parseFiles(options._, options.color, options.border, options.failed);
};

// Run it!
main(process.argv.slice(2));
