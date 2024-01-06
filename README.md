# js-skill-tree

The goal of this project is to have a method that can *automatically* track how many javascript functions I've used (and ideally display it in a cool skill tree).

The code MVP should eventually:
1) pull commits & commit diffs by user
2) parse for typical javascript functions/commands/methods (like https://www.w3schools.com/js/js_if_else.asp) that have been written in the commit diff.
3) compare the committed functions/commands/methods (step 2) to a list of all the typical functions/commands/methods.
4) Display the % Complete of functions/commands/methods 

## Setup
You need to install npm (you can do this by installing [Node.js](https://nodejs.org/en/download)). Once that is done, run `npm install` in this directory to install all the requirements.

You will also need to get an access token from here: https://github.com/settings/personal-access-tokens/new

## Usage
First, run `node .` to start the script. You may be prompted to enter your gmail credentials in-browser if you haven't done so already. When prompted for granting access, make sure you click "Select All".  If you would like to be prompted to change your email login, delete the `token.js` file and run the script again.

If you add any other dependencies, please do it by running `npm install --save <my-dependency>` so it is added to package.json for the next person to install. Otherwise, add the package manually to package.json