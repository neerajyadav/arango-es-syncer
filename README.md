# Arango ElasticSearch Syncer

## Description
NodeJs app to sync data from `arangodb` to `elasticsearch`. The app works as a service and will continously run on the server. `dockerfile` is included if you want to deploy it as a container.

In most of the cases easiest way to steup `ETL` pipeline between your database and `elasticsearch` is, using `logstash`. Many popular databases like `mongodb`, `couchbase` etc. provides a logstash input plugin to listen db changes. However there is no official logstash input plugin for `arangodb` which you can use to setup `ETL` pipeline to push db changes to `es`.
 
This project provides a good starting point to write down your own solution to sync db between elasticsearch and arangodb. It uses latest WAL access [API](https://www.arangodb.com/docs/stable/http/replications-walaccess.html#tail-recent-server-operations) to listen database changes. The project is not very much polished but can act as a good starting point.

### Configurations
Configuration are passed via environment variables. During development you can use `.env` file to pass configurations. During development configs are loaded with `dotenv` package. However on production environment it expects configs via Environment variables.

### Files
- `Index.js` - Starting point. It creates global http agent and elasticsearch client which are re-used in every run.
- `syncer-state.service.ts` - Used to save syncer state. `fromTick` and `lastScannedTick`, in case process stops. You can implement [graceful shutodown](https://nodejs.org/api/process.html#process_signal_events) and save syncer state before shutting down the process.
- `wal-tail.reader.ts` - WAL tail reader which reads WAL tail logs incrementally and emit them for further consuming (transformation and es indexing).    
- `tail.transformer.ts` - Tail logs comes in form of [ndjson](http://ndjson.org/). You can filter only document update, delete and create changes based on [type](https://www.arangodb.com/docs/stable/http/replications-walaccess.html#insert--replace-document-2300). Based on `cuid` (collection id) you can figure out document type.
- `es.indexer.ts` - Used to index changes via [`Bulk API`](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/docs-bulk.html). Bulk API also accepts NDJSON.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start:local

# watch mode
$ npm run start:dev

# debug mode
$ npm run start:debug

# production mode
$ npm run start:prod
```

## Stay in touch
- Author - [Neeraj Kumar](mailto:er.neerajyadav@gmail.com)