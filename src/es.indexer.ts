import { Client } from '@elastic/elasticsearch';

export class EsIndexer {
  constructor(private readonly client: Client) { }

  public async index(body: any): Promise<boolean> {
    const response = await this.client.bulk({
      body,
      index: 'test',
      type: '_doc',
    });
    if (response.body.errors === false) {
      return true;
    } else {
      return false;
    }
  }
}
