# Changelog

All changes that impact users of this module are documented in this file, in the [Common Changelog](https://common-changelog.org) format with some additional specifications defined in the [engine CONTRIBUTING file](https://github.com/OpenTermsArchive/engine/blob/main/CONTRIBUTING.md#changelog). This codebase adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased [major]

_Full changeset and discussions: [#4](https://github.com/OpenTermsArchive/engine/pull/4) and [#6](https://github.com/OpenTermsArchive/engine/pull/6)._

> Development of this release was [supported](https://nlnet.nl/project/TOSDR-OTA/) by the [NGI0 Entrust Fund](https://nlnet.nl/entrust), a fund established by [NLnet](https://nlnet.nl/) with financial support from the European Commission's [Next Generation Internet](https://www.ngi.eu) programme, under the aegis of DG CNECT under grant agreement N°101069594.

### Changed

- **Breaking:** Support arbitrary collections as sources; rename `collectionsUrl` config entry into `collections` and wrap it in an array, refer to the [documentation](https://docs.opentermsarchive.org/api/federated/#configuring) for details

## 1.0.0 - 2024-05-23

_Full changeset and discussions: [#5](https://github.com/OpenTermsArchive/engine/pull/5)._

> Development of this release was supported by the [French Ministry for Foreign Affairs](https://www.diplomatie.gouv.fr/fr/politique-etrangere-de-la-france/diplomatie-numerique/) through its ministerial [State Startups incubator](https://beta.gouv.fr/startups/open-terms-archive.html) under the aegis of the Ambassador for Digital Affairs.

### Added

- Publish package on NPM under the name `@opentermsarchive/federation-api`
- Expose npm command `ota-federation-api serve` to start the API server
- **Breaking:** Add required `basePath` configuration; explicitly specify this configuration in your `config/production.json`

### Changed

- **Breaking:** Rename `federated-api` to `federation-api`; update all relevant code references. To update your local clone configuration, use `git remote set-url origin https://github.com/OpenTermsArchive/federation-api.git`
- **Breaking:** Remove default value for `port`; explicitly specify this configuration in your `config/production.json`
- **Breaking:** Prefix environment variable with the `OTA_FEDERATION_API_` scope; Update variable `SMTP_PASSWORD` to `OTA_FEDERATION_API_SMTP_PASSWORD`
- **Breaking:** Nest configurations under the `@opentermsarchive/federation-api` key; reformat your configuration files to nest existing settings within this new key, like this: `{ @opentermsarchive/federation-api: { < your previous configuration >}}`.

## 0.1.1 - 2024-02-15

_Full changeset and discussions: [#3](https://github.com/OpenTermsArchive/engine/pull/3)._

> Development of this release was supported by the [French Ministry for Foreign Affairs](https://www.diplomatie.gouv.fr/fr/politique-etrangere-de-la-france/diplomatie-numerique/) through its ministerial [State Startups incubator](https://beta.gouv.fr/startups/open-terms-archive.html) under the aegis of the Ambassador for Digital Affairs.

### Added

- Log a warning in case log emails cannot be sent because of a missing config

## 0.1.0 - 2023-12-05

_Full changeset and discussions: [#1](https://github.com/OpenTermsArchive/federation-api/pull/1)._

> Development of this release was [supported](https://nlnet.nl/project/TOSDR-OTA/) by the [NGI0 Entrust Fund](https://nlnet.nl/entrust), a fund established by [NLnet](https://nlnet.nl/) with financial support from the European Commission's [Next Generation Internet](https://www.ngi.eu) programme, under the aegis of DG CNECT under grant agreement N°101069594.

### Added

- Create the first version of the API
