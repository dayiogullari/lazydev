# `lazydev-token-reward`

**LazyDev_** provides a simple [`cw20`] token reward contract for any repository admin to use. The contract accepts several configuration parameters on instantiation:

- `name`, `symbol`, `decimals`: These are forwarded to the `cw20-base` code during instantiation.
- `valid_repos`, `valid_orgs`: The repos and/or organizations that the contract will reward contributions for. This allows the same rewards to be used for many repositories, while also preventing abuse by not allowing *any* repositories.
- `cw20_base_code_id`: The code id of the `cw20-base` contract to instantiate for the reward token.

The source code for this contract can be found [here](https://github.com/dayiogullari/lazydev/blob/main/cosmwasm/reward/token/).

[`cw20`]: https://github.com/CosmWasm/cw-plus/blob/main/packages/cw20/README.md
