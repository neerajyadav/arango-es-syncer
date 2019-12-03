import { ConfigsService } from './configs.service';
import { AxiosInstance, AxiosResponse } from 'axios';
import { SyncerStateModel, SyncerState } from './models';

export class SyncerStateService {
  private readonly documentUrl: string;
  constructor(
    private readonly configs: ConfigsService,
    private readonly axiosinstance: AxiosInstance) {
    this.documentUrl = `${this.configs.dbHost}/_db/${this.configs.dbDatabaseName}/_api/document/${this.configs.tickCollectionName}/${this.configs.dbSyncerId}`;
  }

  public async read(): Promise<SyncerStateModel> {
    const response = await this.axiosinstance.get<SyncerStateModel, AxiosResponse<SyncerStateModel>>(this.documentUrl);
    return response.data;
  }

  public async update(state: SyncerState): Promise<boolean> {
    const response = await this.axiosinstance.patch(`${this.documentUrl}?silent=true`, state);
    if (response.status === 201 || response.status === 202) {
      return true;
    } else {
      return false;
    }
  }
}
