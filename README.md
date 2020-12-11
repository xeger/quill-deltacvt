# Quill Delta Converter

# What is this?

TODO

# How do I use it?

TODO

# Contributing to the Project

## Running the tests

```sh
npm run test
```

## Type-checking the code

```sh
npm run type-check
```

And to run in `--watch` mode:

```sh
npm run type-check:watch
```

## Distributing new versions

### Increment the version

```sh
npm version <patch|minor|major>
```

### Build distributables

```sh
npm run clean # not strictly necessary, but good form
npm run build
```

### Publish to NPM

```sh
npm publish
```

