# GitHub

We use several GitHub REST API endpoints for **LazyDev\_**.

## User

> `/user`

To prove a user's github account, we use the [get the authenticated user] endpoint. This is an authenticated request, and a successful response proves the currently authenticated user's ownership of the github account. To prevent frontrunning of this proof, we use a two-step commit/reveal scheme.

## Pull Request

> `/repos/{owner}/{repo}/pulls/{pull_number}`

To prove a pull request has been completed, we use the [get a pull request] endpoint. This is an unauthenticated endpoint, anyone can submit a `zkTLS` proof of a pull request. The `zkTLS` proof verifies the authenticity of the response from GitHub, and the on-chain logic requires that a user has been linked already.

## Repo Admin

> `/repos/{repoOwner}/{repo}`

To prove a user is an admin in a repository (and therefore is able to set up the repo in **LazyDev\_**), we use the [get a repository] endpoint, which returns an additional `permission` key if called with the token of an authenticated user. This which ensures that the submitting user has admin permissions for the repository.

[get a pull request]: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#get-a-pull-request
[get a repository]: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
[get the authenticated user]: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
