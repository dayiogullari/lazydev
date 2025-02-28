# Rewards

**LazyDev_** supports fully-customizable reward schemes. Rewards for a repository are associated with pull request labels, with every label potentially providing multiple rewards.

Rewards are distributed via CosmWasm contracts. When rewarding a pull request, the **LazyDev_** contract will read all configured rewards for the repository and call the associated contract with the following message:

```rust
/// The reward callback message for the reward contracts. This is expected to be
/// in an `ExecuteMsg` under the key `"reward"`.
#[cw_serde]
pub struct RewardMsg {
    /// The repo that the rewards are for.
    pub repo: Repo,
    /// The github pr id that the rewards are for.
    pub pr_id: u64,
    /// The github user id of the user receiving the reward.
    pub user_id: u64,
    /// The recipient address to send the rewards to.
    pub recipient_address: Addr,
    /// Additional reward config.
    pub reward_config: String,
}
```

The callback includes an additional `reward_config` field, which is any additional config included during repo configuration. This enables reusing the same contract multiple times with different rewarding logic. For example, the [`lazydev-token-reward`](rewards/token.md) contract parses the `reward_config` as the amount of tokens to mint into `recipient_address`. A potential config could look like this:

```json
{
  "label_configs": [
    {
      "label_id": 12345,
      "reward_config": "100",
      "reward_contract": "contract_a"
    },
    {
      "label_id": 67890,
      "reward_config": "50",
      "reward_contract": "contract_a"
    },
    {
      "label_id": 67890,
      "reward_config": "10",
      "reward_contract": "contract_b"
    }
  ]
}
```

This configures the label with id 12345 with one reward (100 tokens from `contract_a`), and the label with id 67890 with two rewards (50 tokens from `contract_a` and 10 tokens from `contract_b`). If a pull request were to have both of these labels, the user would receive 150 `contract_a` and 10 `contract_b`.

