const { Octokit } = require("@octokit/core"); // for making HTTP requests to the GitHub API
const esprima = require('esprima'); // for parsing JavaScript code
require('dotenv').config(); // for getting the .env file to work

const username = 'erwilliams64'; // Replace with your GitHub username
const token = process.env.GITHUB_TOKEN; // Make sure the .env file has GITHUB_TOKEN set. The token is generated using this flow: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token
    

const octokit = new Octokit({
    auth: token,
});



async function getAllReposWithCommits(username) {
    try {
        const response = await octokit.request('GET /search/commits', {
            q: `author:${username}`,
            headers: {
                'Accept': 'application/vnd.github.cloak-preview'
            }
        });
        const repoNames = new Set();
        response.data.items.forEach(commit => {
            repoNames.add(commit.repository.full_name); // Using full_name to get the 'owner/repo' format
        });
        const reposArray = Array.from(repoNames);
        console.log('Repositories with Commits:', reposArray); // Log the list of repositories
        return reposArray;
    } catch (error) {
        console.error("Error fetching repositories with commits:", error);
        return [];
    }
}

async function getCommitDiff(owner, repo, sha) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/commits/{sha}', {
            owner,
            repo,
            sha
        });
        return response.data.files; // This will contain the diff for each file in the commit
    } catch (error) {
        console.error(`Error fetching commit diff for ${sha} in repo ${repo}:`, error.response?.status, error.message);
        return [];
    }
}


async function getCommitsForRepo(owner, repo) {
    console.log(`Fetching commits for repo: ${owner}/${repo}`);
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
            owner,
            repo
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching commits for repo ${repo}:`, error.response?.status, error.message);
        return [];
    }
}

function parseJavaScriptFunctions(content) {
    try {
        const ast = esprima.parseScript(content);
        const functions = [];

        esprima.tokenize(content, {}, (node) => {
            if (node.type === 'FunctionDeclaration') {
                functions.push(node.value);
            }
        });

        return functions;
    } catch (error) {
        console.error("Error parsing JavaScript:", error);
        return [];
    }
}

// const octokit = new Octokit({
//     auth: token
//   })
  
//   await octokit.request('GET /repos/{owner}/{repo}/commits', {
//     owner: username,
//     repo: "erwilliams64/js-skill-tree",
//     headers: {
//       'X-GitHub-Api-Version': '2022-11-28'
//     }
//   })


async function main() {
    const repos = await getAllReposWithCommits(username);

    for (const repoFullName of repos) {
        // Correctly extract the owner and repo from the full repo name
        const [owner, repo] = repoFullName.split("/");
        const commits = await getCommitsForRepo(owner, repo);

        for (const commit of commits) {
            const commitSha = commit.sha;
            const commitDate = commit.commit.committer.date;
            const commitDiff = await getCommitDiff(owner, repo, commitSha);

            console.log(`Repo: ${repoFullName}, Commit SHA: ${commitSha}, Date: ${commitDate}`);
           

            console.log(`Repo: ${repo}, Commit SHA: ${commitSha}, Date: ${commitDate}`);
            console.log(commitDiff)
            // // Fetching the actual JavaScript code for each commit is a complex task.
            // // This requires either cloning the repository and checking out each commit,
            // // or fetching individual files via the API.

            // const commitCode = ""; // Replace this with the actual code fetched for the commit
            // const functions = parseJavaScriptFunctions(commitCode);
            // console.log(`In repo ${repo}, commit ${commit.sha} has functions:`, functions);
        }
    }
}

async function checkTokenScopes() {
    try {
        const response = await octokit.request('GET /user');
        console.log('Token Scopes:', response.headers['x-oauth-scopes']);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
checkTokenScopes();
