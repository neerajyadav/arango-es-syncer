import joi from '@hapi/joi';
interface EnvConfig {
  [key: string]: string;
}

export class ConfigsService {
  private envConfig: EnvConfig;
  constructor() {
    const configs: EnvConfig = {};
    const configKeys: string[] = Object.keys(this.envSchema.describe().keys);
    configKeys.forEach(element => {
      configs[element] = process.env[element];
    });
    this.envConfig = this.validateInput(configs);
  }

  private readonly envSchema = joi.object({
    NODE_ENV: joi
      .string()
      .default('production'),
    DB_HOST: joi
      .string()
      .uri()
      .required(),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_DATABASE_NAME: joi.string().required(),
    DB_SYNCER_ID: joi.number().required(),
    DB_CLIENT_INFO: joi.string().required(),
    ES_NODE_URL: joi.string().required(),
    TICK_COLLECTION_NAME: joi.string().required(),
    POLLING_INTERVAL: joi.number().required(),
  });

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const result = this.envSchema.validate(envConfig);
    if (result.error) {
      throw new Error(`Config validation error: ${result.error.message}`);
    }
    return result.value;
  }

  public get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }

  public get dbHost(): string {
    return this.envConfig.DB_HOST;
  }
  public get dbUsername(): string {
    return this.envConfig.DB_USERNAME;
  }
  public get dbPassword(): string {
    return this.envConfig.DB_PASSWORD;
  }
  public get dbDatabaseName(): string {
    return this.envConfig.DB_DATABASE_NAME;
  }
  public get dbSyncerId(): string {
    return this.envConfig.DB_SYNCER_ID;
  }
  public get dbClientInfo(): string {
    return this.envConfig.DB_CLIENT_INFO;
  }
  public get esNodeUrl(): string {
    return this.envConfig.ES_NODE_URL;
  }
  public get tickCollectionName(): string {
    return this.envConfig.TICK_COLLECTION_NAME;
  }
  public get pollingInterval(): number {
    return Number(this.envConfig.POLLING_INTERVAL);
  }
}
