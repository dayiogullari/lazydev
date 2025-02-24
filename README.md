# Lazydev

> Rewarding developers for contributions

Lazydev is a platform for open source projects to verifiably reward and incentivize contributors.

Since the dawn of the open source revolution, developers have been thanklessly contributing to projects without the expectation of renumeration. While the ethos of open source is strong, it can also be frustrating as these contributors need income to sustain themselves. As a result, many are forced to pursue their open source passions as hobbies rather than full-time jobs.

 Although many projects are willing to fund their supporters, there is no platform to automate the rewarding process while also incentivizing the contributions. 

This platform should be transparent, verifiable, and permissionless. With LazyDev_, project owners can register their repositories with fully customizable rewards, such as tokens, NFTs, and other assets, linked to the labels on the pull requests. Users are then able verify their contributions on-chain and automatically receive their rewards.  

Using GitHub REST data on-chain presents a challenge: how can one ensure that repositories, users, and pull requests are valid? LazyDev_ solves this problem with its underlying `zkTLS` technology, leveraging [Reclaim Protocol].
`zkTLS` is a multi-party protocol that bridges Web2 private data to the Web3 ecosystem by generating cryptographic proofs for HTTPS requests at the TLS layer. This allows a smart contract to verify the authenticity of an HTTPS request, ensuring that the data (in this case from GitHub) remains unaltered.

## GitHub

We use several github rest api endpoints for lazydev.

### User

> `/user`

To prove a user's github account, we use the [get the authenticated user] endopint. This is an authenticated request, and a successful response proves the currently authenticated user's ownership of the github account. To prevent frontrunning of this proof, we use a two-step commit/reveal scheme.

### Pull Request

> `/repos/{owner}/{repo}/pulls/{pull_number}`

To prove a pull request has been completed, we use the [get a pull request] endpoint. This is an unauthenticated endpoint, anyone can submit a `zkTLS` proof of a pull request. The `zkTLS` proof verifies the authenticity of the response from GitHub, and the on-chain logic requires that a user has been linked already.

### Repo Admin

> `/repos/${repoOwner}/${repo}/collaborators/${githubUsername}/permission`

To prove a user is an admin in a repository (and therefore is able to set up the repo in lazydev), we use the [get repository permissions for a user] endpoint. This is combined with the [#user] proof, which ensures that the submitting user is also the owner of the account with admin permissions.

## Commit/Reveal Scheme

`zkTLS` proofs to authenticated endpoints must be treated with care. Since they are verified on-chain, it is possible for a proof to be "stolen" and frontrun when it is submitted:

- User A generates a proof of an authenticated endpoint
- User A submits the proof on-chain
- User B sees the transaction in the mempool and submits the same transaction with higher gas
- User B now recieves whatever on-chain effect user A should have received

To prevent this from happening, we use a two-step commit/reveal scheme inspired by [ens]:

A secret is generated client side, and then the sha256 sum of this secret is committed as the key to the (key, value) tuple that will later be sent with a valid proof. Once this is committed on chain, the off-chain client can then read the commitment and ensure that it was indeed committed as expected (i.e. that it was not frontrun), and then submit a second transaction which itself contains the the `zkTLS` proof, along with the raw secret. Since only one commitement can be submitted per key, it is not possible for this proof to be frontrun.

:::note
This commit/reveal scheme is vulnerable to spam, where a malicious user could repeatedly "claim" a key by submitting a garbage commitment with the key. A potential mitigation for this could be to require a certain amount of funds to be locked on commit, with the funds only being returned on successful claim of that commit. (This could also be an additional revenue stream for lazydev, where we take a fee from each commit.)
:::

## Useful Links

- Reclaim verifier contract on neutron: <https://docs.reclaimprotocol.org/sdk/cosmos/neutron#copy-this-to-neutronfunctionsjs>
- Lazydev contract address: <https://neutron.celat.one/pion-1/contracts/neutron17763lnw3wp74zg8etdpultvj2sysx2qrsv0hwrjay3dwyyd9uqyqhcxr86>
- Lazydev Token Reward code id: <https://neutron.celat.one/pion-1/codes/10893>
- `cw20-base` code id: <https://neutron.celat.one/pion-1/codes/10880>

[get a pull request]: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#get-a-pull-request
[reclaim protocol]: https://reclaimprotocol.org/
[get the authenticated user]: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
[commit/reveal scheme]: #commit-reveal-scheme
[ens]: https://support.ens.domains/en/articles/7900438-registration-steps
[get repository permissions for a user]: https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2022-11-28#get-repository-permissions-for-a-user
