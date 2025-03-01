# Commit-Reveal Scheme

`zkTLS` proofs to authenticated endpoints must be treated with care. Since they are verified on-chain, it is possible for a proof to be "stolen" and frontrun when it is submitted:

- User A generates a proof of an authenticated endpoint
- User A submits the proof on-chain
- User B sees the transaction in the mempool and submits the same transaction with higher gas
- User B now recieves whatever on-chain effect user A should have received

To prevent this from happening, we use a two-step commit/reveal scheme inspired by [ENS]:

A secret is generated client side, and then the sha256 sum of this secret is committed as the key to the (key, value) tuple that will later be sent with a valid proof. Once this is committed on chain, the off-chain client can then read the commitment and ensure that it was indeed committed as expected (i.e. that it was not frontrun), and then submit a second transaction which itself contains the the `zkTLS` proof, along with the raw secret. Since only one commitement can be submitted per key, it is not possible for this proof to be frontrun.

## Spam Prevention

This commit/reveal scheme is vulnerable to spam, where a malicious user could repeatedly "claim" a key by submitting a garbage commitment with the key. A potential mitigation for this could be to require a certain amount of funds to be locked on commit, with the funds only being returned on successful claim of that commit. This could also be an additional revenue stream for **LazyDev\_**, where we take a fee from each commit.

[ens]: https://support.ens.domains/en/articles/7900438-registration-steps
