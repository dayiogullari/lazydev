# NFT
# `lazydev-nft-reward`

**LazyDev_** provides a simple [`cw721`] NFT reward contract for any repository admin to use. The contract accepts several configuration parameters on instantiation:

- `collection_name`, `symbol` : These are forwarded to the `cw721-base` code during instantiation.
- `valid_repos`, `valid_orgs`: The repos and/or organizations that the contract will reward contributions for. This allows the same rewards to be used for many repositories, while also preventing abuse by not allowing *any* repositories.
- `cw721_base_code_id`: The code id of the `cw721-base` contract to instantiate for the reward NFT.

[`cw721`]: https://github.com/CosmWasm/cw-plus/blob/main/packages/cw20/README.md
[`Config`]: https://github.com/dayiogullari/lazydev/blob/main/cosmwasm/reward/nft/src/msg.rs
