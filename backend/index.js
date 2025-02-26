/**
 * This backend implementation is only neccesary because Reclaim protocol doesn't support proof generation on client side.
 * It doesn't use any central databases, and only works like a worker that you use to generate proofs so it doesnt harm decentralization of the project.
 *
 * We have deployed it to implement to front end, but anyone is free to run locally
 * Put applicationId(s) and applicationSecret(s) in the env file
 * npm install
 * npm start
 */

const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");

const { ReclaimClient } = require("@reclaimprotocol/zk-fetch");
const Reclaim = require("@reclaimprotocol/js-sdk");

dotenv.config({ path: path.join(__dirname, ".env") });
/**
 * Multiple application support and iteration through the clients to distribute the proof usage among apps
 */
const APPLICATION_IDS = process.env.APPLICATION_IDS.split(",");
const APPLICATION_SECRETS = process.env.APPLICATION_SECRETS.split(",");
const clients = [];
let reclaimApplicationIndex = 0;

for (let i = 0; i < APPLICATION_IDS.length; i++)
  clients.push(new ReclaimClient(APPLICATION_IDS[i], APPLICATION_SECRETS[i]));

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
  }),
);
const server = http.createServer(app);

app.use(express.static(__dirname + "/public"));

app.get("/index", (req, res) => {
  return res.status(200).json({ message: "im running" });
});
// This endpoint is used by the users in the linking phase to prove if the user exists on github in a way that verifiable onchain.
// This proof also provides authenticity since it requires an 'accessToken' from github.
app.post("/proof-user", async (req, res) => {
  try {
    const accessToken = req.body?.accessToken;
    if (!accessToken) return res.status(400).json({ message: "bad_request" });

    //configuring the zkTLS proof request.
    const url = `https://api.github.com/user`;
    const publicOptions = {
      method: "GET",
      Accept: "application/vnd.github.v3+json",
    };
    //Autherization header is in the private options to keep it as a secret.
    const privateOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseMatches: [
        {
          type: "regex",
          value: '"id"\\s*:\\s*(?<id>\\d+)',
        },
      ],
    };
    const client = clients[reclaimApplicationIndex];
    reclaimApplicationIndex =
      reclaimApplicationIndex == APPLICATION_IDS.length - 1 ? 0 : ++reclaimApplicationIndex;

    //Proof generation
    const proof = await client.zkFetch(url, publicOptions, privateOptions);

    console.log("proof: ", proof);
    //Verifying the proof to ensure it's valid
    const isVerified = await Reclaim.verifyProof(proof);

    console.log("isVerified", isVerified);
    //Proof data getting transform to allow contracts to verify onchain
    const proofData = Reclaim.transformForOnchain(proof);

    console.log("Transformed onchain: ", JSON.stringify(proofData));
    //Proof data gets returned to Client.
    return res.status(201).json({ proofData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "database_error", error: error });
  }
});
// This endpoint is used to prove if a PR is valid. There is no need for authenticity since github user id's already
//linked with wallet in the contract.
// Since the PR in the github is off-chain data, contract need to be sure that PR exists and is valid.
app.post("/proof-pr", async (req, res) => {
  // the PR id and corresponding repo.
  const org = req.body.org;
  const repo = req.body.repo;
  const pullId = req.body.pullId;

  if (!org || !repo || !pullId) return res.status(400).json({ message: "bad_request" });

  const client = clients[reclaimApplicationIndex];
  console.log(client, reclaimApplicationIndex, APPLICATION_IDS);
  reclaimApplicationIndex =
    reclaimApplicationIndex == APPLICATION_IDS.length - 1 ? 0 : ++reclaimApplicationIndex;

  //configuring the zkTLS proof request.
  const prUrl = `https://api.github.com/repos/${org}/${repo}/pulls/${pullId}`;
  try {
    const proof = await client.zkFetch(
      prUrl,
      {
        method: "GET",
      },
      {
        responseMatches: [
          {
            type: "regex",
            value: "(?<json>\\{.+\\})",
          },
        ],
      },
    );

    console.log("proof: ", proof);
    //Verifying the proof to ensure it's valid
    const isVerified = await Reclaim.verifyProof(proof);

    console.log("isVerified", isVerified);
    //Proof data getting transform to allow contracts to verify onchain

    const proofData = Reclaim.transformForOnchain(proof);

    console.log("proofData", JSON.stringify(proofData));

    //Proof data gets returned to the client
    return res.status(201).json({ proofData });
  } catch (error) {
    console.log(error);
    if (error.message == 'Provider returned error 403"') {
      return res
        .status(403)
        .json({
          message: "forbidden",
          error_description: "this user doesnt have access to the repo, they are not the owner",
        });
    }
    if (error.message == 'Provider returned error 404"') {
      return res
        .status(404)
        .json({ message: "not_found", error_description: "this repo doesnt exist" });
    }
    res.status(500).json({ message: "database_error", error: error });
  }
});
//This endpoint is used by 'project owners' and not the users. This endpoint proves the permissions of the github user on the repo.
//It is authenticated, and to make the call to register the repo, user should complate the linking process first.
app.post("/proof-repo-owner", async (req, res) => {
  // The repo information and the access token to make the permisson call.
  const repoOwner = req.body.repoOwner;
  const repo = req.body.repo;
  const githubUsername = req.body.githubUsername;
  const accessToken = req.body.accessToken;

  if (!repo || !repoOwner || !githubUsername || !accessToken)
    return res.status(400).json({ message: "bad_request" });

  //configuring the zkTLS proof request.
  const url = `https://api.github.com/repos/${repoOwner}/${repo}/collaborators/${githubUsername}/permission`;
  const publicOptions = {
    method: "GET",
    Accept: "application/vnd.github.v3+json",
  };
  //Autherization header is in the private options to keep it as a secret.
  const privateOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    responseMatches: [
      {
        type: "regex",
        value: "(?<json>\\{.+\\})",
      },
    ],
  };
  try {
    const client = clients[reclaimApplicationIndex];
    console.log(client);
    reclaimApplicationIndex =
      reclaimApplicationIndex == APPLICATION_IDS.length - 1 ? 0 : ++reclaimApplicationIndex;

    const proof = await client.zkFetch(url, publicOptions, privateOptions);

    console.log("proof: ", proof);

    //Verifying the proof to ensure it's valid
    const isVerified = await Reclaim.verifyProof(proof);
    console.log("isVerified", isVerified);

    //Proof data getting transform to allow contracts to verify onchain
    const proofData = Reclaim.transformForOnchain(proof);

    console.log("proofData", JSON.stringify(proofData));

    //Proof data gets returned to the client
    return res.status(201).json({ proofData });
  } catch (error) {
    console.log(error);
    if (error.message == 'Provider returned error 401"') {
      return res
        .status(401)
        .json({ message: "not_authorized", error_description: "bad token credentials" });
    }
    if (error.message == 'Provider returned error 403"') {
      return res
        .status(403)
        .json({
          message: "forbidden",
          error_description: "this user doesnt have access to the repo, they are not the owner",
        });
    }
    if (error.message == 'Provider returned error 404"') {
      return res
        .status(404)
        .json({ message: "not_found", error_description: "this repo doesnt exist" });
    }
    res.status(500).json({ message: "database_error", error: error });
  }
});

server.listen(8080, () => {
  console.log(`Server is on port 8080`);
});
