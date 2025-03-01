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

## Useful Links

- Reclaim verifier contract on neutron: <https://docs.reclaimprotocol.org/sdk/cosmos/neutron#copy-this-to-neutronfunctionsjs>
- **LazyDev\_** contract address: <https://neutron.celat.one/pion-1/contracts/neutron1sltsd9zvh9up0vpqxjhu35ftjhuvv77u432722f2y3uk9kmnev6svfxejd>
- **LazyDev\_** Token Reward code id: <https://neutron.celat.one/pion-1/codes/10961>
- `cw20-base` code id: <https://neutron.celat.one/pion-1/codes/10880>

[ens]: https://support.ens.domains/en/articles/7900438-registration-steps
[get a pull request]: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#get-a-pull-request
[get a repository]: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
[get the authenticated user]: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
[reclaim protocol]: https://reclaimprotocol.org/
