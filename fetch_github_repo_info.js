import fetch from "node-fetch";
import * as fs from "fs";

//Getting your own github access token: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
const ACCESS_TOKEN = "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";

function findOwnerAndRepo(link) {
  const regex = /(\/(\w|-)+)/g;
  const found = link.match(regex);
  console.log(found);
  if (found.length > 2) {
    // remove the beginning '/'. Return "Owner/Repo".
    return [(found[1] + found[2]).substring(1), true];
  } else if (found.length > 1) {
    // remove the beginning '/'. Return "Owner".
    return [found[1].substring(1), false];
  }
  return ["invalid", false];
}

async function fetchRepoInfo(repo) {
  // API doc: https://docs.github.com/en/rest/repos/repos#get-a-repository
  try {
    let info = await fetch("https://api.github.com/repos" + repo, {
      headers: {
        authorization: `token ${ACCESS_TOKEN}`,
      },
    });
    if (info.status !== 200) {
      console.log(repo, info.headers);
      return null;
    }
    return await info.json();
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function fetchRepoPulls(repo) {
  // API doc: https://docs.github.com/en/rest/pulls/pulls#list-pull-requests
  try {
    const pulls = await fetch(
      "https://api.github.com/repos" + repo + "/pulls",
      {
        headers: {
          authorization: `token ${ACCESS_TOKEN}`,
        },
      }
    );
    if (pulls.status !== 200) {
      return null;
    }
    return await pulls.json();
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function fetchRepoContributors(repo) {
  try {
    const pulls = await fetch(
      "https://api.github.com/repos/" + repo + "/contributors",
      {
        headers: {
          authorization: `token ${ACCESS_TOKEN}`,
        },
      }
    );
    if (pulls.status !== 200) {
      console.log(pulls.headers);
      return null;
    }
    return await pulls.json();
  } catch (e) {
    console.log(e);
    return null;
  }
}

const repoFile = "./git_repos_sample.txt";
const dataFile = "./github_contributor_data.csv";
let fileWriter = fs.createWriteStream(dataFile, {
  flags: "a", // 'a' means appending (old data will be preserved)
});
// fileWriter.write(
//   "name,open_issues_count,stargazers_count,pulls_count,forks_count,watchers_count,subscribers_count,has_issues,has_wiki,owner,owner_type,url,created_date,updated_date\n"
// );

fileWriter.write("name,contributors\n");

const allContents = fs.readFileSync(repoFile, "utf-8");
// console.log(allContents);
const lines = allContents.split(/\r?\n/);
for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  const [repoId, isRepo] = findOwnerAndRepo(line);
  console.log(repoId, isRepo);
  if (!isRepo) {
    //only organization name is found in the link. Not dealing with this case for now.
    continue;
  }
  // const info = await fetchRepoInfo(repoId);
  // if (!info) {
  //   continue;
  // }
  // const pulls = await fetchRepoPulls(repoId);
  // if (!pulls) {
  //   continue;
  // }
  const contributors = await fetchRepoContributors(repoId);
  if (!contributors) {
    console.log(contributors);
    continue;
  }
  console.log(`${repoId},${contributors.length}\n`);
  // fileWriter.write(`${repoId},${contributors.length}\n`);
}
