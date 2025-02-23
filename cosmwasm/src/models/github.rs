use cosmwasm_schema::cw_serde;

/// Simplified model of the response from [`/repos/{owner}/{repo}/pulls/{pull_number}`](get-pr)
/// endpoint, containing only the fields we require. All additional fields will be ignored by serde.
///
/// [get-pr]: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#get-a-pull-request
#[cw_serde]
pub struct PrBody {
    pub url: String,
    pub number: u64,
    pub user: User,
    pub merged: bool,
    pub labels: Vec<Label>,
}

#[cw_serde]
pub struct Label {
    pub id: u64,
}

#[cw_serde]
pub struct User {
    pub id: u64,
}

#[cw_serde]
pub struct CollaboratorPermissionsBody {
    pub permission: String,
    pub user: User,
}
