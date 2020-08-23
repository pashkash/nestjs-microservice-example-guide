# Before the deploy

In this chapter we talk about tests, linter, `package.json` file and `gitlab-ci.yml`.

First of all, make sure that you
1. connected to the VPN, due integration tests uses database connection
2. set up `.env` Vault file with auth variables, for example
```bash
VAULT_HOST=http://vault.localhost
VAULT_AUTH='{"config": {"role_id": "%get it from devbox env%", "secret_id": "%get it from devbox env%"}}'
```

We'll start with the project settings file.

## Reading package.json
As you know, this file consists of
1. meta information about your project
2. dev dependencies  
3. a set of maintenance scripts  
Please, [read all these items](https://classic.yarnpkg.com/en/docs/package-json/) to be able to read and fill this file properly.

> Some components can use this file for storing its settings e.g., [Jest](https://jestjs.io/docs/en/configuration), but, please, tend to use Vault for managing the Company's secrets. 

List out the scripts with comments. Any of them runnable with `yarn run %command%`:

```js
{
...
  "scripts": {
    // remove `rm -rf` dist foilder
    "prebuild": "rimraf dist", 
    // build typescript files into dist folder
    "build": "nest build",  
    //  prettifier, standard for the company
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    // run main application 
    "start": "nest start main", 
    // will restart the app after each code change
    "start:dev": "yarn run start --watch", 
    // will run application with debug information and restart the app after each code change
    "start:debug": "yarn run start --debug --watch", 
    // run lint check
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    // run unit tests with coverage table in the end 
    "test": "yarn run test:unit", 
    // alias for test
    "test:unit": "jest --config ./jest.unit.json  --coverage",
    // run unit tests with coverage table in the end and restart it after each code change 
    "test:unit:watch": "yarn run test:unit --watch",
    // run integration tests 
    "test:integration": "docker-compose up",
    // uses the same main module as the main.ts; uses for custom cli commands 
    "console": "node dist/console",
    "console:dev": "ts-node -r tsconfig-paths/register src/console.ts",
    // generate openapi-schema.json file based on swagger decorators 
    "generate:open-api-schema": "yarn run --silent console generate open-api-schema > public/openapi-schema.json", 
    // generate ReDoc API specs based on openapi-schema.json file
    "generate:redoc": "redoc-cli bundle -o public/redoc.html public/openapi-schema.json",  
    // increment latest package version and update changelog file; launches by CI/CD before release
    "changelog": "auto-changelog -p",
    // typeorm cli, e.g., for making migrations 
    "typeorm": "node --require ts-node/register ./node_modules/typeorm/cli.js --config src/config/postgres.config.ts"
  },
...
 ```
Two specified configs here
[Husky](https://www.npmjs.com/package/husky) prevents pushing without lint and unit tests checks
```json
  "husky": {
    "hooks": {
      "pre-push": "yarn run lint && yarn run test && yarn run format" 
    }
  }
```
Swagger meta-data, used by [jsonp](https://www.npmjs.com/package/jsonp)
```json
  "config": {
    "swagger": {
      "title": "Microservice Template",
      "description": "Use it to start making Microservice"
    }
  },
```


## ESLint
Due TSLint not already supported we used [ESLint parser](https://github.com/typescript-eslint/typescript-eslint) configured with `.eslintrc.js` and `.eslintignore` files.   
Usage
```
yarn run lint
```

### Integration tests
Integration tests scenario 
1. Up node:12 and postgres docker containers with `Dockerfile` and `docker-compose.yml` files 
2. Clone current Devbox database schema and restore it into the postgres container with `docker-scripts/db-init-script.sh`
2. Apply migrations before start testing
4. Make integration tests 

Usage
```
yarn run test:integration
```

Uses `jest.integration.json` config file.

### Unit tests
Unit tests just runs with
```
yarn run test:unit
```
Uses `jest.unit.json` config file.


## GitLab CI
In a nutshell, there are four stages: lint, test, docs, and create-release. Docs stage updates autogenerate documentation and its artifacts.
Create-release increments package version then runs auto-changelog, then add changes files to git and publish project into company Verdaccio registry.

### Gitlab Pages ready
Note, that pipeline dumps docs and artifacts into `./public` folder; thus, they will be available to open on [Gitlab Pages](https://docs.gitlab.com/ee/user/project/pages/) as soon as pages will be set up. 

## Summary
That's it. Only one thing left is documentation. 

## Reading quality check
1. Learn the Health Controller to remind the basis, try to explain it.
2. Write an Interceptor that will answer with HTTP Not found 'Bars' response on SampleRequestDto equal to `{ ping: "food" }`. 