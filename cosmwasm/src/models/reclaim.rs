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
    use crate::models::github::UserRepoBody;
    // use crate::models::github::UserRepoBody;

    #[test]
    fn serde() {
        let json = r#"{
    "claimInfo": {
        "context": "{\"extractedParameters\":{\"json\":\"{\\\"id\\\":939152815,\\\"node_id\\\":\\\"R_kgDON_pVrw\\\",\\\"name\\\":\\\"test\\\",\\\"full_name\\\":\\\"ahmedzk100/test\\\",\\\"private\\\":false,\\\"owner\\\":{\\\"login\\\":\\\"ahmedzk100\\\",\\\"id\\\":200156625,\\\"node_id\\\":\\\"U_kgDOC-4l0Q\\\",\\\"avatar_url\\\":\\\"https://avatars.githubusercontent.com/u/200156625?v=4\\\",\\\"gravatar_id\\\":\\\"\\\",\\\"url\\\":\\\"https://api.github.com/users/ahmedzk100\\\",\\\"html_url\\\":\\\"https://github.com/ahmedzk100\\\",\\\"followers_url\\\":\\\"https://api.github.com/users/ahmedzk100/followers\\\",\\\"following_url\\\":\\\"https://api.github.com/users/ahmedzk100/following{/other_user}\\\",\\\"gists_url\\\":\\\"https://api.github.com/users/ahmedzk100/gists{/gist_id}\\\",\\\"starred_url\\\":\\\"https://api.github.com/users/ahmedzk100/starred{/owner}{/repo}\\\",\\\"subscriptions_url\\\":\\\"https://api.github.com/users/ahmedzk100/subscriptions\\\",\\\"organizations_url\\\":\\\"https://api.github.com/users/ahmedzk100/orgs\\\",\\\"repos_url\\\":\\\"https://api.github.com/users/ahmedzk100/repos\\\",\\\"events_url\\\":\\\"https://api.github.com/users/ahmedzk100/events{/privacy}\\\",\\\"received_events_url\\\":\\\"https://api.github.com/users/ahmedzk100/received_events\\\",\\\"type\\\":\\\"User\\\",\\\"user_view_type\\\":\\\"public\\\",\\\"site_admin\\\":false},\\\"html_url\\\":\\\"https://github.com/ahmedzk100/test\\\",\\\"description\\\":\\\"read\\\",\\\"fork\\\":false,\\\"url\\\":\\\"https://api.github.com/repos/ahmedzk100/test\\\",\\\"forks_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/forks\\\",\\\"keys_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/keys{/key_id}\\\",\\\"collaborators_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/collaborators{/collaborator}\\\",\\\"teams_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/teams\\\",\\\"hooks_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/hooks\\\",\\\"issue_events_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/issues/events{/number}\\\",\\\"events_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/events\\\",\\\"assignees_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/assignees{/user}\\\",\\\"branches_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/branches{/branch}\\\",\\\"tags_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/tags\\\",\\\"blobs_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/git/blobs{/sha}\\\",\\\"git_tags_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/git/tags{/sha}\\\",\\\"git_refs_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/git/refs{/sha}\\\",\\\"trees_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/git/trees{/sha}\\\",\\\"statuses_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/statuses/{sha}\\\",\\\"languages_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/languages\\\",\\\"stargazers_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/stargazers\\\",\\\"contributors_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/contributors\\\",\\\"subscribers_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/subscribers\\\",\\\"subscription_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/subscription\\\",\\\"commits_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/commits{/sha}\\\",\\\"git_commits_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/git/commits{/sha}\\\",\\\"comments_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/comments{/number}\\\",\\\"issue_comment_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/issues/comments{/number}\\\",\\\"contents_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/contents/{+path}\\\",\\\"compare_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/compare/{base}...{head}\\\",\\\"merges_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/merges\\\",\\\"archive_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/{archive_format}{/ref}\\\",\\\"downloads_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/downloads\\\",\\\"issues_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/issues{/number}\\\",\\\"pulls_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/pulls{/number}\\\",\\\"milestones_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/milestones{/number}\\\",\\\"notifications_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/notifications{?since,all,participating}\\\",\\\"labels_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/labels{/name}\\\",\\\"releases_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/releases{/id}\\\",\\\"deployments_url\\\":\\\"https://api.github.com/repos/ahmedzk100/test/deployments\\\",\\\"created_at\\\":\\\"2025-02-26T04:33:56Z\\\",\\\"updated_at\\\":\\\"2025-02-26T04:33:57Z\\\",\\\"pushed_at\\\":\\\"2025-02-26T04:33:57Z\\\",\\\"git_url\\\":\\\"git://github.com/ahmedzk100/test.git\\\",\\\"ssh_url\\\":\\\"git@github.com:ahmedzk100/test.git\\\",\\\"clone_url\\\":\\\"https://github.com/ahmedzk100/test.git\\\",\\\"svn_url\\\":\\\"https://github.com/ahmedzk100/test\\\",\\\"homepage\\\":null,\\\"size\\\":0,\\\"stargazers_count\\\":0,\\\"watchers_count\\\":0,\\\"language\\\":null,\\\"has_issues\\\":true,\\\"has_projects\\\":true,\\\"has_downloads\\\":true,\\\"has_wiki\\\":true,\\\"has_pages\\\":false,\\\"has_discussions\\\":false,\\\"forks_count\\\":0,\\\"mirror_url\\\":null,\\\"archived\\\":false,\\\"disabled\\\":false,\\\"open_issues_count\\\":0,\\\"license\\\":null,\\\"allow_forking\\\":true,\\\"is_template\\\":false,\\\"web_commit_signoff_required\\\":false,\\\"topics\\\":[],\\\"visibility\\\":\\\"public\\\",\\\"forks\\\":0,\\\"open_issues\\\":0,\\\"watchers\\\":0,\\\"default_branch\\\":\\\"main\\\",\\\"permissions\\\":{\\\"admin\\\":true,\\\"maintain\\\":true,\\\"push\\\":true,\\\"triage\\\":true,\\\"pull\\\":true},\\\"network_count\\\":0,\\\"subscribers_count\\\":1}\"},\"providerHash\":\"0xdcb73385494c6804decf6e8bc9da1beb42ec28d59127ddfdf011781e39cd5541\"}",
        "parameters": "{\"body\":\"\",\"method\":\"GET\",\"responseMatches\":[{\"type\":\"regex\",\"value\":\"(?<json>\\\\{.+\\\\})\"}],\"responseRedactions\":[],\"url\":\"https://api.github.com/repos/ahmedzk100/test\"}",
        "provider": "http"
    },
    "signedClaim": {
        "claim": {
            "epoch": 1,
            "identifier": "0xac8e89fed64b5825567080749c7a63142f9f157d128dff1ec758947d772790d5",
            "owner": "0x3e2194b30936306db1924f1695d52f49e80823cd",
            "timestampS": 1740613841
        },
        "signatures": [
            "0x15298be574dae16398aa588eb01ca3df82ac50280da102a97fcc83447be5c6c03bbdccbe31225d6578e1957a3c90cf7e1e0e6d16e9fa6de66d4be04c4cecdf311c"
        ]
    }
}"#;

        let proof = serde_json_wasm::from_str::<Proof>(json).unwrap();

        let col = proof
            .deserialize_context::<JsonExtractedParameters>()
            .unwrap();

        let col =
            serde_json_wasm::from_str::<UserRepoBody>(&col.extracted_parameters.json).unwrap();

        dbg!(col);
    }
}
