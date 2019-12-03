import { AxiosInstance } from 'axios';
import { ConfigsService } from './configs.service';
import { SyncerState } from './models/syncer-state.model';
import { Observable, interval, from, Subject } from 'rxjs';
import { tap, switchMap, takeUntil, filter } from 'rxjs/operators';
import { TailResponse } from './models';
/**
 * replaication logger based on https://www.arangodb.com/docs/stable/http/replications-walaccess.html#tail-recent-server-operations
 */
export class WalTailReader {
  private readonly tailUrl: string;
  private fromTick: string;
  private lastScanned: string;
  public exitNotifier: Subject<boolean>;
  constructor(
    private readonly axinstance: AxiosInstance,
    private readonly configService: ConfigsService,
    private readonly syncerState: SyncerState) {
    this.tailUrl = `${this.configService.dbHost}/_db/${this.configService.dbDatabaseName}/_api/wal/tail?syncerId=${this.configService.dbSyncerId}&clientInfo=${this.configService.dbClientInfo}`;
    this.fromTick = this.syncerState.fromTick;
    this.lastScanned = this.syncerState.lastScanned;
    this.exitNotifier = new Subject<boolean>();
  }

  public fetcher(): Observable<TailResponse> {
    return this.poll(this.fetchTail);
  }

  private fetchTail(axinstance: AxiosInstance, url: string): Observable<TailResponse> {
    const prom = axinstance.get<string>(url).then(response => {
      const lastIncluded = response.headers['x-arango-replication-lastincluded'];
      const scannedTill = response.headers['x-arango-replication-lastscanned'];
      const tailResponse: TailResponse = {
        log: response.data,
        lastIncluded,
        lastScanned: scannedTill,
      };
      return tailResponse;
    }).catch(err => {
      console.error(err);
      this.syncerState.lastError = err;
      const tail: TailResponse = {
        log: null,
        lastIncluded: '0',
        lastScanned: '0',
      };
      return tail;
    });
    return from(prom);
  }
  private poll(fetchFunction: (instance: AxiosInstance, url: string) => Observable<TailResponse>): Observable<TailResponse> {
    return interval(this.configService.pollingInterval)
      .pipe(
        switchMap<number, Observable<TailResponse>>(() => fetchFunction(this.axinstance, this.makeTailUrl())),
        tap(tail => { // keep tap above filter. In case there are no changes, at least last scanned will be changed from the db server.
          // in case no response from server, last included can be 0. So update it only when receive a non-zero value.
          if (tail.lastIncluded !== '0') {
            this.fromTick = tail.lastIncluded;
          }
          if (tail.lastScanned !== '0') {
            this.lastScanned = tail.lastScanned;
          }
        }),
        filter<TailResponse>(tail => tail.log?.length > 0),
        takeUntil<TailResponse>(this.exitNotifier.asObservable()),
      );
  }

  private makeTailUrl(): string {
    return `${this.tailUrl}&from=${this.fromTick ?? 0}&lastScanned=${this.lastScanned ?? 0}`;
  }
}
