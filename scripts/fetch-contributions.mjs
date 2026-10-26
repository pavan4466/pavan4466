import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "contributions.json");
const LOGIN = "pavan4466";

function getToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
  } catch {
    throw new Error("No GitHub token. Set GH_TOKEN or run `gh auth login`.");
  }
}

const now = new Date();
const to = now.toISOString();
const fromDate = new Date(now);
fromDate.setUTCDate(fromDate.getUTCDate() - 365);
const from = fromDate.toISOString();

const query = `
query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            color
            contributionCount
            date
            weekday
          }
        }
      }
    }
  }
}`;

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `bearer ${getToken()}`,
    "Content-Type": "application/json",
    "User-Agent": "pavan-profile-readme",
  },
  body: JSON.stringify({ query, variables: { login: LOGIN, from, to } }),
});

if (!response.ok) {
  throw new Error(`GitHub API returned ${response.status}: ${await response.text()}`);
}

const payload = await response.json();
if (payload.errors) {
  throw new Error(payload.errors.map((error) => error.message).join("; "));
}

const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
if (!calendar?.weeks?.length) {
  throw new Error(`No contribution calendar returned for ${LOGIN}.`);
}

const output = {
  login: LOGIN,
  fetchedAt: to,
  from,
  to,
  totalContributions: calendar.totalContributions,
  weeks: calendar.weeks,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(
  `wrote data/contributions.json — ${calendar.totalContributions} contributions across ${calendar.weeks.length} weeks`,
);
