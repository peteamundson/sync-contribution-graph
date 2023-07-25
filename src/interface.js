import inquirer from "inquirer";
import script from "./index.js";
import axios from "axios";
import { buildAxiosRequest } from "./endpoint.js";

console.log("\nHello there!\n");

const questions = [
  {
    type: "list",
    name: "gitHubType",
    message: "What type of GitHub should we pull contributions from:",
    choices: [{
      name: "GitHub.com",
      value: "gh",
      checked: true
    },{
      name: "GitHub Enterprise",
      value: "ghe"
    }]
  },
  {
    type: "input",
    name: "gheServer",
    message: "Please input the domain name of the GitHub Enterprise server (do not include 'https' or any slashes):",
    when: (answers) => answers.gitHubType === "ghe"
  },
  {
    type: "input",
    name: "gheCookie",
    message: "Please input an active session cookie from a browser that is logged in to the GitHub Enterprise server (session cookie is named 'user_session'):",
    when: (answers) => answers.gitHubType === "ghe"
  },
  {
    type: "input",
    name: "username",
    message:
      "Please enter GitHub nickname with which you'd like to sync contributions:",
    validate: (value, answers) => {
      const req = buildAxiosRequest(answers, value)
      return axios
        .get(req.url, req.config)
        .then(() => true)
        .catch(() => "There was an issue validating that user. Please enter an existing GitHub username.")
      },
  },
  {
    type: "input",
    name: "year",
    message: "What year would you like to sync?",
    default() {
      return new Date().getFullYear();
    },
  },
  {
    type: "list",
    message: "How would you like this to happen?",
    name: "execute",
    choices: [
      {
        name: `Generate a bash script & execute it immediately.\n  Note: it *will* push to origin main and it would be difficult to undo.`,
        value: true,
      },
      {
        name: "Only generate, no execution.",
        value: false,
      },
    ],
    default: () => false,
  },
  {
    type: "confirm",
    name: "confirm",
    message: "Ready to proceed?",
  },
];

inquirer.prompt(questions).then((answers) => {
  if (answers.confirm) {
    script(answers);
  }
});
