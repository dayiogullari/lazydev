# zkTLS

**LazyDev\_** utilizes `zkTLS` to trustlessly verify GitHub contributions of users, leveraging [Reclaim Protocol]'s `zkTLS` implementation. [The zk in zkTLS] is a good introduction for those unfamiliar with `zkTLS`.

 Reclaim protocol's proof generation in client didn't work so well, so the proofs are generated in the Backend. Backend's only responsibility is to generate proof and return to client.

zkTLS proofs then verified in LazyDev_ smart contract. This provides the confidentiality of the Github data, creating a gateway between web3 smart contracts and web2 private data.

[reclaim protocol]: https://reclaimprotocol.org
[the zk in zktls]: https://blog.reclaimprotocol.org/posts/zk-in-zktls
