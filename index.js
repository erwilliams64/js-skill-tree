const { Octokit } = require("@octokit/core"); // for making HTTP requests to the GitHub API
const esprima = require('esprima'); // for parsing JavaScript code
require('dotenv').config(); // for getting the .env file to work

const username = 'erwilliams64'; // Replace with your GitHub username
const token = process.env.GITHUB_TOKEN; // Make sure the .env file has GITHUB_TOKEN set

if (!token) {
    throw new Error('GITHUB_TOKEN is not set. Make sure you have defined it in your .env file.');
}

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

async function getCommitsForRepo(owner, repo) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
            owner,
            repo
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching commits for repo ${repo}:`, error.message);
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

async function main() {
    const repos = await getAllReposWithCommits(username);

    for (const repo of repos) {
        const commits = await getCommitsForRepo(username, repo);

        for (const commit of commits) {
            // Extract commit SHA and date
            const commitSha = commit.sha;
            const commitDate = commit.commit.committer.date;

            console.log(`Repo: ${repo}, Commit SHA: ${commitSha}, Date: ${commitDate}`);

            // // Fetching the actual JavaScript code for each commit is a complex task.
            // // This requires either cloning the repository and checking out each commit,
            // // or fetching individual files via the API.

            // const commitCode = ""; // Replace this with the actual code fetched for the commit
            // const functions = parseJavaScriptFunctions(commitCode);
            // console.log(`In repo ${repo}, commit ${commit.sha} has functions:`, functions);
        }
    }
}

main();