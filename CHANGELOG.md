<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.2](https://github.com/portabletext/react-portabletext/compare/v3.0.1...v3.0.2) (2023-05-31)

### Bug Fixes

- package should now work with Sanity Studio v2 ([bee2567](https://github.com/portabletext/react-portabletext/commit/bee25677374e05748a15439c492cbe69b6e9ee75))

## [3.0.1](https://github.com/portabletext/react-portabletext/compare/v3.0.0...v3.0.1) (2023-05-31)

### Bug Fixes

- **docs:** added Typescript typing example ([631b3dc](https://github.com/portabletext/react-portabletext/commit/631b3dc1a08cd069ecaefa99962492c471ecfbdc))

## [3.0.0](https://github.com/portabletext/react-portabletext/compare/v2.0.3...v3.0.0) (2023-04-26)

### ⚠ BREAKING CHANGES

- Components defined in `components.types` will now be used even
  if the data shape appears to be a portable text block. In past versions, data
  shapes that appeared to be portable text blocks would always be rendered using
  the default block renderer, with no way of overriding how they would be
  rendered.

### Features

- allow specifying custom component for block-like types ([6407839](https://github.com/portabletext/react-portabletext/commit/6407839fd9042bec6b77d21e62833ecd5b88bcc5))

### Bug Fixes

- confirm a \_type of "block" when using the basic block renderer ([75f1ec4](https://github.com/portabletext/react-portabletext/commit/75f1ec4dcbdd6f9a5c80cfcd6872bb27c57d9770))

## [2.0.3](https://github.com/portabletext/react-portabletext/compare/v2.0.2...v2.0.3) (2023-04-20)

### Bug Fixes

- set list child index correctly ([#61](https://github.com/portabletext/react-portabletext/issues/61)) ([5552d6f](https://github.com/portabletext/react-portabletext/commit/5552d6fa9bf367957cbaa4a658cd1f005060398f))

## [2.0.2](https://github.com/portabletext/react-portabletext/compare/v2.0.1...v2.0.2) (2023-02-27)

### Bug Fixes

- **deps:** update dependencies (non-major) ([#49](https://github.com/portabletext/react-portabletext/issues/49)) ([034b49b](https://github.com/portabletext/react-portabletext/commit/034b49b31a9346a790e6c196be7342fc509a8d53))
