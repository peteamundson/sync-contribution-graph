import { parse } from "node-html-parser";
import axios from "axios";
import fs from "fs";
import shell from "shelljs";
import { buildAxiosRequest } from "./endpoint.js";

// Gathers needed git commands for bash to execute per provided contribution data.
const getCommand = (contribution) => {
  return `GIT_AUTHOR_DATE=${contribution.date}T12:00:00 GIT_COMMITER_DATE=${contribution.date}T12:00:00 git commit --allow-empty -m "Rewriting History!" > /dev/null\n`.repeat(
    contribution.count
  );
};

export default async (answers) => {

  // Returns contribution graph html for a full selected year.
  const req = buildAxiosRequest(answers)
  const res = await axios.get(req.url, req.config);

  // Retrieves needed data from the html, loops over green squares with 1+ contributions,
  // and produces a multi-line string that can be run as a bash command.
  const script = parse(res.data)
    .querySelectorAll("[data-count]")
    .map((el) => {
      return {
        date: el.attributes["data-date"],
        count: parseInt(el.attributes["data-count"]),
      };
    })
    .filter((contribution) => contribution.count > 0)
    .map((contribution) => getCommand(contribution))
    .join("")
    .concat("git pull origin main\n", "git push -f origin main");

  fs.writeFile("script.sh", script, () => {
    console.log("\nFile was created successfully.");

    if (answers.execute) {
      console.log("This might take a moment!\n");
      shell.exec("sh ./script.sh");
    }
  });
};
