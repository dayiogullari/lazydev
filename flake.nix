{
  description = "Build a cargo project with a custom toolchain";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    crane.url = "github:ipetkov/crane";

    flake-utils.url = "github:numtide/flake-utils";

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, crane, flake-utils, rust-overlay, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
        };

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

        buildWasmBinary = dir:
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
              cargoLockList =
                [
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

        lazydev-schema = pkgs.stdenv.mkDerivation {
          name = "lazydev-schema";
          version = "0.0.0";
          src = craneLib.cleanCargoSource ./.;
          buildInputs = [(craneLib.buildPackage {
            src = craneLib.cleanCargoSource ./.;
            strictDeps = true;

            CARGO_PROFILE = "dev";

            doCheck = false;

            meta.mainProgram = "schema";
          })];
          buildPhase = ''
            schema
            mv ./schema $out
          '';
        };
      in
      {
        checks = {
          inherit lazydev;
        };

        packages = {
          inherit lazydev;
          inherit lazydev-token-reward;
          inherit lazydev-schema;
        };

        devShells.default = craneLib.devShell {
          # Inherit inputs from checks.
          checks = self.checks.${system};

          # Extra inputs can be added here; cargo and rustc are provided by default
          # from the toolchain that was specified earlier.
          packages = [
            pkgs.binaryen
            pkgs.nodejs
            pkgs.rust-bin.stable.latest.default
            pkgs.taplo
          ];
        };
      });
}
