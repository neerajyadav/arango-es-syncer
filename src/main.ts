import axios from 'axios';
import * as https from 'https';
import * as fs from 'fs';
import { ConfigsService } from './configs.service';
import { WalTailReader } from './wal-tail.reader';
import { Client } from '@elastic/elasticsearch';
import { SyncerStateService } from './syncer-state.service';
import { SyncerState } from './models/syncer-state.model';
import { EsIndexer } from './es.indexer';
import { map } from 'rxjs/operators';
import { transform } from './tail.transformer';

async function bootstrap() {
  console.log('hey!!!');
  const configs = new ConfigsService();
  const agent = new https.Agent({
    // ca: [fs.readFileSync('arango.ca.pem')],  // in case you are using self signed certificate you can read it from root folder.
    keepAlive: true,
    keepAliveMsecs: 10000,
    host: '127.0.0.1',
  });
  const axinstance = axios.create({
    auth: { username: configs.dbUsername, password: configs.dbPassword },
    withCredentials: true,
    httpsAgent: agent,
  });
  const syncerService = new SyncerStateService(configs, axinstance);
  const stateModel = await syncerService.read();
  const state: SyncerState = {
    fromTick: stateModel.fromTick,
    lastScanned: stateModel.lastScanned,
  };
  const tailReader = new WalTailReader(axinstance, configs, state);
  const esClient = new Client({ node: configs.esNodeUrl, name: 'arangodb-syncer' });
  const indexer = new EsIndexer(esClient);
  tailReader.fetcher()
    .pipe(map(tail => transform(tail)))
    .subscribe(res => {
      console.log('-----------------');
      indexer.index(res.log).then(value => {
        if (value === true) {
          state.fromTick = res.lastIncluded;
          state.lastScanned = res.lastScanned;
        }
      });
    });

  // setTimeout(() => {
  //   console.log('shutting down!!');
  //   syncerService.update(state);
  //   tailReader.exitNotifier.next(true);
  // }, 60000);
}
bootstrap();
