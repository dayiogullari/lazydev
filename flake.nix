{
  description = "Build a cargo project with a custom toolchain";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    treefmt-nix.url = "github:numtide/treefmt-nix";

    crane.url = "github:ipetkov/crane";

    flake-parts.url = "github:hercules-ci/flake-parts";

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      crane,
      flake-parts,
      rust-overlay,
      treefmt-nix,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ treefmt-nix.flakeModule ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      perSystem =
        {
          config,
          self',
          pkgs,
          system,
          lib,
          ...
        }:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ (import rust-overlay) ];
          };

          ensureAtRepositoryRoot = ''
            # If the current directory contains flake.nix, then we are at the repository root
            if [[ -f flake.nix ]]
            then
              echo "We are at the repository root. Running script..."
            else
              echo "We are NOT at the repository root. Please cd to the repository root and try again."
              exit 1
            fi
          '';

          dbg =
            value:
            builtins.trace (
              if value ? type && value.type == "derivation" then
                "derivation: ${value}"
              else
                pkgs.lib.generators.toPretty { } value
            ) value;

          nightlyVersion = "2025-02-16";
          channel = "nightly-${nightlyVersion}";

          rustToolchain = pkgs.rust-bin.fromRustupToolchain {
            inherit channel;
            targets = [ "wasm32-unknown-unknown" ];
            profile = "minimal";
            components = [
              "rustc"
              "cargo"
              "rustfmt"
              "rust-std"
              "rust-docs"
              "rust-analyzer"
              "clippy"
              "miri"
              "rust-src"
              "llvm-tools-preview"
            ];
          };

          # NB: we don't need to overlay our custom toolchain for the *entire*
          # pkgs (which would require rebuidling anything else which uses rust).
          # Instead, we just want to update the scope that crane will use by appending
          # our specific toolchain there.
          craneLib = (crane.mkLib pkgs).overrideToolchain rustToolchain;

          buildWasmBinary =
            dir:
            let
              dashesToUnderscores = builtins.replaceStrings [ "-" ] [ "_" ];

              inherit (craneLib.crateNameFromCargoToml { cargoToml = ./${dir}/Cargo.toml; }) pname;
            in
            craneLib.buildPackage {
              src = craneLib.cleanCargoSource ./.;
              cargoToml = ./${dir}/Cargo.toml;
              strictDeps = true;

              cargoExtraArgs = "-p ${pname} --lib --target wasm32-unknown-unknown -j1 -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort";

              doCheck = false;

              cargoVendorDir = craneLib.vendorMultipleCargoDeps {
                # inherit (craneLib.findCargoFiles crateSrc) cargoConfigs;
                cargoLockList = [
                  ./Cargo.lock
                  "${rustToolchain.passthru.availableComponents.rust-src}/lib/rustlib/src/rust/library/Cargo.lock"
                ];
              };

              buildInputs = [
                # Add additional build inputs here
                pkgs.binaryen
              ];
              installPhase = ''
                ${pkgs.binaryen}/bin/wasm-opt -O3 target/wasm32-unknown-unknown/release/${dashesToUnderscores pname}.wasm -o $out
              '';
              # postInstall = ''
              #   # ls -alh
              #   # ls -alh $out
              #   mv $out
              # '';
            };

          lazydev = buildWasmBinary ".";
          lazydev-token-reward = buildWasmBinary "cosmwasm/reward/token";

          schema =
            let
              lazydev-schema = craneLib.buildPackage {
                src = craneLib.cleanCargoSource ./.;
                cargoBuildExtraArgs = "-p lazydev-token-reward";
                strictDeps = true;
                CARGO_PROFILE = "dev";
                doCheck = false;
                meta.mainProgram = "schema";
              };
              lazydev-token-reward-schema = craneLib.buildPackage {
                src = craneLib.cleanCargoSource ./.;
                strictDeps = true;
                CARGO_PROFILE = "dev";
                doCheck = false;
                meta.mainProgram = "schema";
              };
            in
            pkgs.stdenv.mkDerivation {
              name = "schema";
              version = "0.0.0";
              src = craneLib.cleanCargoSource ./.;
              buildInputs = [ ];
              buildPhase = ''
                mkdir $out

                ${lazydev-schema}/bin/schema
                mv ./schema $out/lazydev

                ${lazydev-token-reward-schema}/bin/schema
                mv ./schema $out/lazydev-token-reward
              '';
            };

          # i was not able to nixify this incredibly cursed package
          ts-codegen = pkgs.writeShellApplication {
            name = "ts-codegen";
            runtimeInputs = [ pkgs.deno ];
            text = ''
              ${ensureAtRepositoryRoot}

              npx @cosmwasm/ts-codegen generate --plugin client --schema ${schema}/lazydev --out ./frontend/ts/lazydev --name lazydev --no-bundle
              npx @cosmwasm/ts-codegen generate --plugin client --schema ${schema}/lazydev-token-reward --out ./frontend/ts/lazydev-token-reward --name lazydev-token-reward --no-bundle
            '';
          };
        in
        {
          checks = {
            inherit lazydev lazydev-token-reward;
          };

          packages = {
            inherit
              lazydev
              lazydev-token-reward
              schema
              ts-codegen
              ;
          };

          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              rustfmt = {
                enable = true;
              };
              nixfmt = {
                enable = true;
              };
              taplo = {
                enable = true;
                package = pkgs.taplo;
              };
              biome = {
                enable = true;
                package = pkgs.biome;
              };
              mdformat = {
                enable = true;
              };
            };
            settings = {
              options = [
                "format"
                "--write"
                "--config-path"
                ./biome.json
              ];
            };
          };

          devShells.default = craneLib.devShell {
            checks = self.checks.${system};

            packages = [
              pkgs.binaryen
              pkgs.nodejs
              pkgs.biome
              pkgs.taplo
            ];
            nativeBuildInputs = [
              config.treefmt.build.wrapper
            ] ++ (dbg lib.attrsets.attrValues config.treefmt.build.programs);
          };
        };
    };
}
