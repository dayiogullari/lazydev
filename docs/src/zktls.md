# zkTLS

**LazyDev\_** utilizes `zkTLS` to trustlessly verify GitHub contributions of users, leveraging [Reclaim Protocol]'s `zkTLS` implementation. [The zk in zkTLS] is a good introduction for those unfamiliar with `zkTLS`.

 At the time of writing this, Reclaim Protocol's client side proof generation is not quite mature enough to use in production. As such, the proofs are generated in a backend hosted by the LazyDev_ team. The only responsibility of this backend server is to do the `zkFetch` HTTP reqeust and return it to the client.

These `zkTLS` proofs are then verified in the **LazyDev_** smart contract. This provides the confidentiality of the GitHub data, creating a gateway between web3 smart contracts and web2 private data.

[reclaim protocol]: https://reclaimprotocol.org
[the zk in zktls]: https://blog.reclaimprotocol.org/posts/zk-in-zktls
