# twiba - Test 1

> Analysis of Twitter Accounts

The goal of this test is to create a library that allows to run analysis on a list of Twitter accounts.
A demo list is provided in the file `accounts.json`.

## Requirements

1. Create one script for each the tests.
1. Use recent packages from npmjs.com.
1. Write the scripts in NodeJS, no front-end is needed.
1. All the code, comments, variables and commits should be in English.
1. The result of the test should be submitted as a PR on this repository, assigned to `@beeman`.
1. The result should be a complete node package, with installation instructions.
1. Make sure the code is following best practices, no duplication, write reusable code.
1. In case of any questions, feel free to open an issue or ask me via email (bram@colmena.io).

### Test 1

> Retrieve id's for twitter handles

For each account in `accounts.json` we want to retrieve the ID of the account.
Similar to the functionality of https://tweeterid.com/ ,  but then in a custom JavaScript library.

A part of the accounts in `accounts.json` already have this ID, some others do not.

- Goal is to have a method in which a twitter handle can be passed in, and the ID rolls out.
- The ID does not need to be saved back to the file.

### Test 2

> Retrieve meta data for twitter handles

Retrieve 'meta-data' for each of the accounts in `accounts.json`

- What is the data of the last tweet?
- What is the total number of tweets for this account?
- How many followers does this account have?
- How many accounts does this account follow?

- Any other meta-data that of the account that you think is relevant.

### Test 3

> Retrieve information of followers

For all the accounts in `accounts.json`

- Find the names of the accounts that are followers
- Save these names in a JSON-file on disk, per account a separate file.

### Extras points:

- Unit tests.
- Configuration of API Keys using https://github.com/lorenwest/node-config .
- The functionality of Test 3 but than for `following`.
