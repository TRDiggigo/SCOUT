export interface ConfigVendorDto {
  vendorId: string;
  vendorName: string;
  trackingStatus: 'active' | 'inactive' | 'review_queue' | 'blocked';
}

export interface ConfigWeightsDto {
  marketMaturityWeight: number;
  integrationWeight: number;
  governanceWeight: number;
}

export interface ConfigSourceDto {
  sourceId: string;
  sourceType: 'website' | 'docs' | 'pricing' | 'security' | 'compliance' | 'other';
  url: string;
}

export interface ConfigProvidersDto {
  primaryModel: string;
  fallbackModel?: string;
  timeoutMs: number;
}

export interface ConfigLimitsDto {
  maxVendorConcurrency: number;
  maxBudgetUsdPerRun: number;
  autoAddVendors: boolean;
  allowVendorContact: boolean;
  publicSourcesOnly: boolean;
  lowConfidenceThreshold: number;
  divergenceEscalationThresholdPct: number;
  sharepointPersistenceOnly: boolean;
}

export interface ConfigValidateRequestDto {
  vendors?: ConfigVendorDto[];
  weights?: ConfigWeightsDto;
  sources?: ConfigSourceDto[];
  providers?: ConfigProvidersDto;
  limits?: ConfigLimitsDto;
}

export interface ConfigValidationErrorDto {
  path: string;
  message: string;
}

export interface ConfigValidateResponseDto {
  valid: boolean;
  errors: ConfigValidationErrorDto[];
}

const configStore: {
  vendors: ConfigVendorDto[];
  weights: ConfigWeightsDto;
  sources: ConfigSourceDto[];
  providers: ConfigProvidersDto;
  limits: ConfigLimitsDto;
} = {
  vendors: [
    { vendorId: 'vendor-001', vendorName: 'Alpha AI', trackingStatus: 'active' },
    { vendorId: 'vendor-002', vendorName: 'Beta Stack', trackingStatus: 'active' },
  ],
  weights: { marketMaturityWeight: 40, integrationWeight: 30, governanceWeight: 30 },
  sources: [
    { sourceId: 'source-docs', sourceType: 'docs', url: 'https://example.com/docs' },
    { sourceId: 'source-security', sourceType: 'security', url: 'https://example.com/security' },
  ],
  providers: { primaryModel: 'gpt-4.1-mini', fallbackModel: 'gpt-4.1-nano', timeoutMs: 15000 },
  limits: {
    maxVendorConcurrency: 5,
    maxBudgetUsdPerRun: 500,
    autoAddVendors: false,
    allowVendorContact: false,
    publicSourcesOnly: true,
    lowConfidenceThreshold: 70,
    divergenceEscalationThresholdPct: 15,
    sharepointPersistenceOnly: true,
  },
};

/**
 * WP-04.5/WP-05.1: typed in-memory config model until stable persistence contracts are integrated.
 */
export class ConfigService {
  public async getVendorsConfig(): Promise<ConfigVendorDto[]> {
    return configStore.vendors.map((item) => ({ ...item }));
  }

  public async updateVendorsConfig(items: ConfigVendorDto[]): Promise<ConfigVendorDto[]> {
    configStore.vendors = items.map((item) => ({ ...item }));
    return this.getVendorsConfig();
  }

  public async getWeightsConfig(): Promise<ConfigWeightsDto> {
    return { ...configStore.weights };
  }

  public async updateWeightsConfig(item: ConfigWeightsDto): Promise<ConfigWeightsDto> {
    configStore.weights = { ...item };
    return this.getWeightsConfig();
  }

  public async getSourcesConfig(): Promise<ConfigSourceDto[]> {
    return configStore.sources.map((item) => ({ ...item }));
  }

  public async updateSourcesConfig(items: ConfigSourceDto[]): Promise<ConfigSourceDto[]> {
    configStore.sources = items.map((item) => ({ ...item }));
    return this.getSourcesConfig();
  }

  public async getProvidersConfig(): Promise<ConfigProvidersDto> {
    return { ...configStore.providers };
  }

  public async updateProvidersConfig(item: ConfigProvidersDto): Promise<ConfigProvidersDto> {
    configStore.providers = { ...item };
    return this.getProvidersConfig();
  }

  public async getLimitsConfig(): Promise<ConfigLimitsDto> {
    return { ...configStore.limits };
  }

  public async updateLimitsConfig(item: ConfigLimitsDto): Promise<ConfigLimitsDto> {
    configStore.limits = { ...item };
    return this.getLimitsConfig();
  }

  public async validateConfig(payload: ConfigValidateRequestDto): Promise<ConfigValidateResponseDto> {
    const errors: ConfigValidationErrorDto[] = [];

    if (payload.vendors) {
      payload.vendors.forEach((vendor, index) => {
        if (!vendor.vendorId?.trim()) {
          errors.push({ path: `vendors[${index}].vendorId`, message: 'vendorId must be a non-empty string.' });
        }

        if (!vendor.vendorName?.trim()) {
          errors.push({ path: `vendors[${index}].vendorName`, message: 'vendorName must be a non-empty string.' });
        }
      });
    }

    if (payload.weights) {
      const { marketMaturityWeight, integrationWeight, governanceWeight } = payload.weights;
      const sum = marketMaturityWeight + integrationWeight + governanceWeight;
      const sumsTo100 = sum === 100;
      const sumsToOne = Math.abs(sum - 1) < 0.000001;

      if (!sumsTo100 && !sumsToOne) {
        errors.push({ path: 'weights', message: 'weights must sum to 100 or 1.0.' });
      }
    }

    if (payload.sources) {
      payload.sources.forEach((source, index) => {
        if (!source.sourceId?.trim()) {
          errors.push({ path: `sources[${index}].sourceId`, message: 'sourceId must be a non-empty string.' });
        }

        if (!source.url?.startsWith('http://') && !source.url?.startsWith('https://')) {
          errors.push({ path: `sources[${index}].url`, message: 'url must start with http:// or https://.' });
        }
      });
    }

    if (payload.providers) {
      if (!payload.providers.primaryModel?.trim()) {
        errors.push({ path: 'providers.primaryModel', message: 'primaryModel must be a non-empty string.' });
      }

      if (!Number.isFinite(payload.providers.timeoutMs) || payload.providers.timeoutMs <= 0) {
        errors.push({ path: 'providers.timeoutMs', message: 'timeoutMs must be greater than 0.' });
      }
    }

    if (payload.limits) {
      if (!Number.isInteger(payload.limits.maxVendorConcurrency) || payload.limits.maxVendorConcurrency <= 0) {
        errors.push({ path: 'limits.maxVendorConcurrency', message: 'maxVendorConcurrency must be a positive integer.' });
      }

      if (!Number.isFinite(payload.limits.maxBudgetUsdPerRun) || payload.limits.maxBudgetUsdPerRun < 0) {
        errors.push({ path: 'limits.maxBudgetUsdPerRun', message: 'maxBudgetUsdPerRun must be greater than or equal to 0.' });
      }

      if (payload.limits.lowConfidenceThreshold < 0 || payload.limits.lowConfidenceThreshold > 100) {
        errors.push({ path: 'limits.lowConfidenceThreshold', message: 'lowConfidenceThreshold must be between 0 and 100.' });
      }

      if (payload.limits.divergenceEscalationThresholdPct < 0 || payload.limits.divergenceEscalationThresholdPct > 100) {
        errors.push({ path: 'limits.divergenceEscalationThresholdPct', message: 'divergenceEscalationThresholdPct must be between 0 and 100.' });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
