use cosmwasm_schema::cw_serde;
use serde::de::DeserializeOwned;

use crate::error::Error;

#[cw_serde]
pub struct Proof {
    #[serde(rename = "claimInfo")]
    pub claim_info: ClaimInfo,
    #[serde(rename = "signedClaim")]
    pub signed_claim: SignedClaim,
}

impl Proof {
    /// Parse the claimInfo field of this proof into the provided type from json.
    pub fn deserialize_context<T: DeserializeOwned>(&self) -> Result<Context<T>, Error> {
        serde_json_wasm::from_str(&self.claim_info.context).map_err(Error::InvalidContext)
    }

    /// Parse the parameters field of this proof from json.
    pub fn deserialize_parameters(&self) -> Result<Parameters, Error> {
        serde_json_wasm::from_str(&self.claim_info.parameters).map_err(Error::InvalidContext)
    }
}

#[cw_serde]
pub struct Parameters {
    pub body: String,
    pub method: String,
    pub url: String,
}

#[cw_serde]
pub struct ClaimInfo {
    pub provider: String,
    pub parameters: String,
    pub context: String,
}

#[cw_serde]
pub struct Context<T> {
    #[serde(rename = "extractedParameters")]
    pub extracted_parameters: T,
}

#[cw_serde]
pub struct SignedClaim {
    pub claim: CompleteClaimData,
    pub signatures: Vec<String>,
}

#[cw_serde]
pub struct CompleteClaimData {
    pub identifier: String,
    pub owner: String,
    pub epoch: u64,
    #[serde(rename = "timestampS")]
    pub timestamp_s: u64,
}

#[cw_serde]
pub struct UserExtractedParameters {
    pub id: String,
}

#[cw_serde]
pub struct JsonExtractedParameters {
    pub json: String,
}

impl JsonExtractedParameters {
    /// Parse the json field of this proof into the provided type.
    pub fn deserialize_json<T: DeserializeOwned>(&self) -> Result<T, Error> {
        serde_json_wasm::from_str(&self.json).map_err(Error::InvalidExtractedParameters)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::github::CollaboratorPermissionsBody;

    #[test]
    fn serde() {
        let json = r#"{
   "claimInfo": {
      "context": "{\"extractedParameters\":{\"json\":\"{\\\"permission\\\":\\\"admin\\\",\\\"user\\\":{\\\"login\\\":\\\"atahanyild\\\",\\\"id\\\":111663792,\\\"node_id\\\":\\\"U_kgDOBqfasA\\\",\\\"avatar_url\\\":\\\"https://avatars.githubusercontent.com/u/111663792?v=4\\\",\\\"gravatar_id\\\":\\\"\\\",\\\"url\\\":\\\"https://api.github.com/users/atahanyild\\\",\\\"html_url\\\":\\\"https://github.com/atahanyild\\\",\\\"followers_url\\\":\\\"https://api.github.com/users/atahanyild/followers\\\",\\\"following_url\\\":\\\"https://api.github.com/users/atahanyild/following{/other_user}\\\",\\\"gists_url\\\":\\\"https://api.github.com/users/atahanyild/gists{/gist_id}\\\",\\\"starred_url\\\":\\\"https://api.github.com/users/atahanyild/starred{/owner}{/repo}\\\",\\\"subscriptions_url\\\":\\\"https://api.github.com/users/atahanyild/subscriptions\\\",\\\"organizations_url\\\":\\\"https://api.github.com/users/atahanyild/orgs\\\",\\\"repos_url\\\":\\\"https://api.github.com/users/atahanyild/repos\\\",\\\"events_url\\\":\\\"https://api.github.com/users/atahanyild/events{/privacy}\\\",\\\"received_events_url\\\":\\\"https://api.github.com/users/atahanyild/received_events\\\",\\\"type\\\":\\\"User\\\",\\\"user_view_type\\\":\\\"public\\\",\\\"site_admin\\\":false,\\\"permissions\\\":{\\\"admin\\\":true,\\\"maintain\\\":true,\\\"push\\\":true,\\\"triage\\\":true,\\\"pull\\\":true},\\\"role_name\\\":\\\"admin\\\"},\\\"role_name\\\":\\\"admin\\\"}\"},\"providerHash\":\"0x717a7f3594d06cee921717bcc9664dfacefc828cde1b31f768a19f64b8784718\"}",
      "parameters": "{\"body\":\"\",\"method\":\"GET\",\"responseMatches\":[{\"type\":\"regex\",\"value\":\"(?<json>\\\\{.+\\\\})\"}],\"responseRedactions\":[],\"url\":\"https://api.github.com/repos/atahanyild/NEVO/collaborators/atahanyild/permission\"}",
      "provider": "http"
    },
    "signedClaim": {
      "claim": {
        "epoch": 1,
        "identifier": "0x925fa3745e6801673f4449f6417e9768fd30805f879a467f61e15fbff28be195",
        "owner": "0x3e2194b30936306db1924f1695d52f49e80823cd",
        "timestampS": 1740249770
      },
      "signatures": [
        "0x4a3013e208a39e895eab6f4ddf37ab898684b17eac572ce5461a717c3ac2eafb4251f9669bc3a9646c857969df47ff70c2aba5e4b9940a62ed8eeee729df71bb1c"
      ]
    }
  
}"#;

        let proof = serde_json_wasm::from_str::<Proof>(json).unwrap();

        let col = proof
            .deserialize_context::<JsonExtractedParameters>()
            .unwrap();

        let col = serde_json_wasm::from_str::<CollaboratorPermissionsBody>(
            &col.extracted_parameters.json,
        )
        .unwrap();

        dbg!(col);
    }
}
