import { ReclaimClient } from "@reclaimprotocol/zk-fetch";
import Reclaim from '@reclaimprotocol/js-sdk';
// import { ReclaimClient } from '@reclaimprotocol/zk-fetch';
// import { Reclaim } from '@reclaimprotocol/js-sdk'

const client = new ReclaimClient("0xd4daa58aea5D545512D3A9Ab2027288095abb549", "0xc7a7bcb0873e35c8f0d51873f3411e2ed54563b6c65a46ca35e8562b50ddcfee");

const generateProof = async () => {
  console.log(Reclaim);

  try {
    // URL to fetch the data from - in this case, the price of Ethereum in USD from the CoinGecko API
    const url = 'https://api.github.com/repos/benluelo/test/pulls/2';
    /* 
    * Fetch the data from the API and generate a proof for the response.
    * The proof will contain the USD price of Ethereum.
    */
    const proof = await client.zkFetch(url, {
      // public options for the fetch request
      method: 'GET',
    }, {
      // headers: {
      //   apiKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
      //   someOtherHeader: "0x0000000000000000000000000000000000000000000000000000000000000000",
      // },
      // options for the proof generation
      responseMatches: [
        /* 
        * The proof will match the response body with the regex pattern (search for the price of ethereum in the response body
        the regex will capture the price in the named group 'price').
        * to extract the price of Ethereum in USD. (e.g. {"ethereum":{"usd":3000}})
        */
        // {
        //   type: "contains",
        //   value: '<span reviewable_state="ready" title="Status: Merged" data-view-component="true" class="State State--merged">'
        // }
        {
          type: "regex",
          value: '(?<json>\\{.+\\})'
        }
      ],
      // responseRedactions: [
      //   {
      //     jsonPath: "$.user"
      //   }
      // ],
    });

    console.log(proof)

    // Verify Proof
    const isVerified = await Reclaim.verifyProof(proof)

    console.log(isVerified)

    // Transform the proof data to be used on-chain
    const proofData = Reclaim.transformForOnchain(proof);

    console.log("proofData", JSON.stringify(proofData))
  } catch (error) {
    console.log(error)
  }
}

generateProof()


// const { ReclaimClient } = require("@reclaimprotocol/zk-fetch");
// const { Reclaim } = require('@reclaimprotocol/js-sdk');

// const client = new ReclaimClient("0xd4daa58aea5D545512D3A9Ab2027288095abb549", "0xc7a7bcb0873e35c8f0d51873f3411e2ed54563b6c65a46ca35e8562b50ddcfee");

// const publicOptions = {
//   method: 'GET', // Method GET/POST/PUT
//   headers: {}
// }
// const privateOptions = {
//   headers: {}, // Secret headers  
//   // responseMatches: [{ type: 'regex', value: '(?<data>.*)' }], 
//   // responseRedactions: [
//   //   // {'regex': '(?<data>.*)'}
//   //   { jsonPath: '$.headers', }
//   // ]
// }

// async function main() {
//   // const path = 'https://api.github.com/search/issues?q=is:pr+repo:unionlabs/union+author:benluelo+state:closed&perpage=1';
//   const path = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

//   const proof = await client.zkFetch(path, publicOptions, privateOptions)
//   return proof;

//   console.log(proof);

//   const isProofVerified = await Reclaim.verifySignedProof(proof);

//   const onchainProof = Reclaim.transformForOnchain(proof);
// }

// main()
