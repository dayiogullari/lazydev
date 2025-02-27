use sha2::{Digest, Sha256};

#[must_use]
pub fn parse_github_api_pull_request_url(url: &str) -> Option<(&str, &str, u64)> {
    let ("", tail) = url.split_once("https://api.github.com/repos/")? else {
        return None;
    };
    let (org, tail) = tail.split_once('/')?;
    let (repo, id) = tail.split_once("/pulls/")?;

    Some((org, repo, id.parse().ok()?))
}

#[must_use]
pub fn parse_github_api_repos_url(url: &str) -> Option<(&str, &str)> {
    let ("", tail) = url.split_once("https://api.github.com/repos/")? else {
        return None;
    };
    let (org, repo) = tail.split_once('/')?;

    Some((org, repo))
}

/// Compute the sha256 hash of the provided bytes.
#[must_use]
pub fn sha256(bz: impl AsRef<[u8]>) -> Vec<u8> {
    Sha256::new().chain_update(bz).finalize().to_vec()
}

#[cfg(test)]
pub mod tests {
    use super::*;

    #[test]
    fn test_parse_github_api_pull_request_url() {
        let url = "https://api.github.com/repos/benluelo/test/pulls/1";

        assert_eq!(
            parse_github_api_pull_request_url(url).unwrap(),
            ("benluelo", "test", 1)
        );
    }

    #[test]
    fn test_parse_github_api_repos_url() {
        let url = "https://api.github.com/repos/atahanyild/NEVO";

        assert_eq!(
            parse_github_api_repos_url(url).unwrap(),
            ("atahanyild", "NEVO")
        );
    }
}
