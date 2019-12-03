export interface SyncerState {
  fromTick: string;
  lastScanned: string;
  updatedOn?: number;
  lastError?: string;
}
export interface SyncerStateModel extends SyncerState {
  readonly _key?: string;
  readonly _id?: string;
}
