# **LazyDev\_**

> Trustlessly rewarding developers for contributions

[!NOTE]
Full version of the documentation can be found in [Documentation](https://docs.lazydev.zone)

**LazyDev\_** is a platform for open source projects to verifiably reward and incentivize contributors.

Since the dawn of the open source revolution, developers have been thanklessly contributing to projects without the expectation of renumeration. While the ethos of open source is strong, it can also be frustrating as these contributors need income to sustain themselves. As a result, many are forced to pursue their open source passions as hobbies rather than full-time jobs.

Although many projects are willing to fund their supporters, there is no platform to automate the rewarding process while also incentivizing the contributions.

This platform should be transparent, verifiable, and permissionless. With **LazyDev\_**, project owners can register their repositories with fully customizable rewards, such as tokens, NFTs, and other assets, linked to the labels on the pull requests. Users are then able verify their contributions on-chain and automatically receive their rewards.

Using GitHub REST data on-chain presents a challenge: how can one ensure that repositories, users, and pull requests are valid? **LazyDev\_** solves this problem with its underlying `zkTLS` technology, leveraging [Reclaim Protocol].
`zkTLS` is a multi-party protocol that bridges Web2 private data to the Web3 ecosystem by generating cryptographic proofs for HTTPS requests at the TLS layer. This allows a smart contract to verify the authenticity of an HTTPS request, ensuring that the data (in this case from GitHub) remains unaltered.

## GitHub

We use several GitHub REST API endpoints for **LazyDev\_**.

### User

> `/user`

To prove a user's github account, we use the [get the authenticated user] endpoint. This is an authenticated request, and a successful response proves the currently authenticated user's ownership of the github account. To prevent frontrunning of this proof, we use a two-step commit/reveal scheme.

### Pull Request

> `/repos/{owner}/{repo}/pulls/{pull_number}`

To prove a pull request has been completed, we use the [get a pull request] endpoint. This is an unauthenticated endpoint, anyone can submit a `zkTLS` proof of a pull request. The `zkTLS` proof verifies the authenticity of the response from GitHub, and the on-chain logic requires that a user has been linked already.

### Repo Admin

> `/repos/{repoOwner}/{repo}`

To prove a user is an admin in a repository (and therefore is able to set up the repo in **LazyDev\_**), we use the [get a repository] endpoint, which returns an additional `permission` key if called with the token of an authenticated user. This which ensures that the submitting user has admin permissions for the repository.

## Commit/Reveal Scheme

`zkTLS` proofs to authenticated endpoints must be treated with care. Since they are verified on-chain, it is possible for a proof to be "stolen" and frontrun when it is submitted:

- User A generates a proof of an authenticated endpoint
- User A submits the proof on-chain
- User B sees the transaction in the mempool and submits the same transaction with higher gas
- User B now recieves whatever on-chain effect user A should have received

To prevent this from happening, we use a two-step commit/reveal scheme inspired by [ENS]:

A secret is generated client side, and then the sha256 sum of this secret is committed as the key to the (key, value) tuple that will later be sent with a valid proof. Once this is committed on chain, the off-chain client can then read the commitment and ensure that it was indeed committed as expected (i.e. that it was not frontrun), and then submit a second transaction which itself contains the the `zkTLS` proof, along with the raw secret. Since only one commitement can be submitted per key, it is not possible for this proof to be frontrun.

> \[!NOTE\]
> This commit/reveal scheme is vulnerable to spam, where a malicious user could repeatedly "claim" a key by submitting a garbage commitment with the key. A potential mitigation for this could be to require a certain amount of funds to be locked on commit, with the funds only being returned on successful claim of that commit. (This could also be an additional revenue stream for **LazyDev\_**, where we take a fee from each commit.)


# Architecture
> \[!NOTE\]
> Before breaking down the architecture to smaller pieces we should understand that the backend is only needed because proofs can not be generated client side thus the backend is like a proxy between Reclaim zkTLS attestors and the client. Hence it doesn't harm the decentralization.  

## Repo Registration Flow
![Repo Registration Flow](static/reporegister.svg)
The 'admin' of the repository first authenticates through Github and get an `access token`.

To set up the project, owner need to prove their Github user and the information that shows that they are the owner of the repository. Hence, they create 2 proofs to send to the contract.

### User proof
With the access token generated by Github, they send a request to backend with the token. Backend is only used as an proof worker, so Backend sends a request to `/user` endpoint with the corresponding access token through the Reclaim Client to get the proof of the request.
> \[!NOTE\]
> Access token is passed as an private option to the client, so the Reclaim attestors does not get to see the token to protect the privacy.  
### Permission proof
Project admin then sends another request to `/repos/${repoOwner}/${repo}/collaborators/` to prove that they have 'admin' permission for the repository. That is needed by the smart contract to verify that the user is actually has permissions to set up the repository.

### Submission to the smart contract
With the proofs, repository owners then interacts with the smart contract. LazyDev_ uses commit/reveal schema to prevent front-running  as explained before.

## Developer Github Account Linking
![GitHub User Account Linking Flow](static/usergithub.svg)
Users needs to link their github account with their wallet adresses before claiming rewards. The process for the user is very similar to the project registration.

The user first authenticates through Github and get an `access token`.

To link the Github user with the wallet, user needs to prove their Github user and the information that shows that they are a valid github user. They create the user proof to send to the contract.

### User proof
With the access token generated by Github, they send a request to backend with the token. Backend is only used as an proof worker, so Backend sends a request to `/user` endpoint with the corresponding access token through the Reclaim Client to get the proof of the request.
> \[!NOTE\]
> Access token is passed as an private option to the client, so the Reclaim attestors does not get to see the token to protect the privacy.  

LazyDev_ is using the commit/reveal schema also for the users as explained before.
### Commit User Transaction:
The Github User Id, wallet address and the hash of a random secret is used in the first transaction. Smart contract then saves this information to compare with the data in the second transaction.

### Link Account Transaction
The user proof, wallet address and the secret itself is used in this transaction. Contract first verifies the zkTLS proof, then compare the secret to the earlier commitment key(hash of the string). if everything is valid, Github user id and the wallet address is linked.

## Reward Distribution Flow
![Pr Reward Flow](static/prreward.svg)
To claim a reward, user must be registered in the smart contract as explained before

zkTLS proof of the pull request data is needed by the contract to ensure that the user is actually opened a PR and it is merged. Backend creates the pull request proof and returns it to the user.

Now user can interact with the smart contract sending the proof. If the proof is valid, smart contract checks the labels of the PR, and trigger the corresponding reward contracts linked with the labels to distribute the reward.


## Useful Links

- Reclaim verifier contract on neutron: <https://docs.reclaimprotocol.org/sdk/cosmos/neutron#copy-this-to-neutronfunctionsjs>
- **LazyDev\_** contract address: <https://neutron.celat.one/pion-1/contracts/neutron1x7977j9cz76g275e5ahx0t69yjagdfrptj28mf38xxn5nmky82mqah882h>
- **LazyDev\_** Token Reward code id: <https://neutron.celat.one/pion-1/codes/10961>
- `cw20-base` code id: <https://neutron.celat.one/pion-1/codes/10880>

[ens]: https://support.ens.domains/en/articles/7900438-registration-steps
[get a pull request]: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#get-a-pull-request
[get a repository]: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
[get the authenticated user]: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
[reclaim protocol]: https://reclaimprotocol.org/
