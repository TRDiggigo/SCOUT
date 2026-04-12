import type { FastifyInstance } from 'fastify';

import { createAuditWriteHelper, executeMutationWithRequiredAudit } from '../middleware/audit-write.js';
import { authenticateRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/role-guard.js';
import { AuditService } from '../services/audit.service.js';
import {
  ConfigService,
  type ConfigLimitsDto,
  type ConfigProvidersDto,
  type ConfigSourceDto,
  type ConfigVendorDto,
  type ConfigWeightsDto,
  type ConfigValidateRequestDto,
} from '../services/config.service.js';
import { ApiError } from '../util/response.js';

interface ConfigValidateRequestBody extends ConfigValidateRequestDto {
  vendors?: unknown;
  weights?: unknown;
  sources?: unknown;
  providers?: unknown;
  limits?: unknown;
}

function assertObjectBody(payload: unknown): asserts payload is Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError({
      code: 'validation_error',
      message: 'Request body must be an object.',
      statusCode: 400,
    });
  }
}

async function validateOrThrow(configService: ConfigService, payload: ConfigValidateRequestDto): Promise<void> {
  const result = await configService.validateConfig(payload);
  if (!result.valid) {
    throw new ApiError({
      code: 'validation_error',
      message: 'Config validation failed.',
      statusCode: 400,
      details: { errors: result.errors },
    });
  }
}

export async function registerConfigRoutes(app: FastifyInstance): Promise<void> {
  const configService = new ConfigService();
  const auditWriteHelper = createAuditWriteHelper(new AuditService());
  const authMode = process.env.AUTH_MODE === 'entra-placeholder' ? 'entra-placeholder' : 'mock';

  const readRoles = [authenticateRequest({ mode: authMode }), requireRoles('ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER')];
  const writeRoles = [authenticateRequest({ mode: authMode }), requireRoles('ROLE_ADMIN')];

  app.post<{ Body: ConfigValidateRequestBody }>('/config/validate', { preHandler: readRoles }, async (request) => {
    assertObjectBody(request.body);
    return configService.validateConfig(request.body);
  });

  app.get('/config/vendors', { preHandler: readRoles }, async () => ({ items: await configService.getVendorsConfig() }));
  app.get('/config/weights', { preHandler: readRoles }, async () => ({ item: await configService.getWeightsConfig() }));
  app.get('/config/sources', { preHandler: readRoles }, async () => ({ items: await configService.getSourcesConfig() }));
  app.get('/config/providers', { preHandler: readRoles }, async () => ({ item: await configService.getProvidersConfig() }));
  app.get('/config/limits', { preHandler: readRoles }, async () => ({ item: await configService.getLimitsConfig() }));

  app.put<{ Body: { items?: unknown } }>('/config/vendors', { preHandler: writeRoles }, async (request) => {
    assertObjectBody(request.body);
    if (!Array.isArray(request.body.items)) {
      throw new ApiError({ code: 'validation_error', message: 'items must be an array.', statusCode: 400 });
    }

    const items = request.body.items as ConfigVendorDto[];
    await validateOrThrow(configService, { vendors: items });
    const beforeState = await configService.getVendorsConfig();

    return executeMutationWithRequiredAudit({
      performMutation: async () => ({ items: await configService.updateVendorsConfig(items) }),
      buildAuditWriteRequest: (result) => ({
        actionType: 'config_changed',
        targetType: 'config',
        targetId: 'vendors',
        actorId: request.user?.userId ?? 'unknown-actor',
        actorType: 'human',
        reason: null,
        beforeState: { items: beforeState },
        afterState: result,
        relatedRunId: null,
        relatedReportId: null,
      }),
      auditWriteHelper,
    });
  });

  app.put<{ Body: { item?: unknown } }>('/config/weights', { preHandler: writeRoles }, async (request) => {
    assertObjectBody(request.body);
    assertObjectBody(request.body.item);

    const item = request.body.item as ConfigWeightsDto;
    await validateOrThrow(configService, { weights: item });
    const beforeState = await configService.getWeightsConfig();

    return executeMutationWithRequiredAudit({
      performMutation: async () => ({ item: await configService.updateWeightsConfig(item) }),
      buildAuditWriteRequest: (result) => ({
        actionType: 'config_changed',
        targetType: 'config',
        targetId: 'weights',
        actorId: request.user?.userId ?? 'unknown-actor',
        actorType: 'human',
        reason: null,
        beforeState: { item: beforeState },
        afterState: result,
        relatedRunId: null,
        relatedReportId: null,
      }),
      auditWriteHelper,
    });
  });

  app.put<{ Body: { items?: unknown } }>('/config/sources', { preHandler: writeRoles }, async (request) => {
    assertObjectBody(request.body);
    if (!Array.isArray(request.body.items)) {
      throw new ApiError({ code: 'validation_error', message: 'items must be an array.', statusCode: 400 });
    }

    const items = request.body.items as ConfigSourceDto[];
    await validateOrThrow(configService, { sources: items });
    const beforeState = await configService.getSourcesConfig();

    return executeMutationWithRequiredAudit({
      performMutation: async () => ({ items: await configService.updateSourcesConfig(items) }),
      buildAuditWriteRequest: (result) => ({
        actionType: 'config_changed',
        targetType: 'config',
        targetId: 'sources',
        actorId: request.user?.userId ?? 'unknown-actor',
        actorType: 'human',
        reason: null,
        beforeState: { items: beforeState },
        afterState: result,
        relatedRunId: null,
        relatedReportId: null,
      }),
      auditWriteHelper,
    });
  });

  app.put<{ Body: { item?: unknown } }>('/config/providers', { preHandler: writeRoles }, async (request) => {
    assertObjectBody(request.body);
    assertObjectBody(request.body.item);

    const item = request.body.item as ConfigProvidersDto;
    await validateOrThrow(configService, { providers: item });
    const beforeState = await configService.getProvidersConfig();

    return executeMutationWithRequiredAudit({
      performMutation: async () => ({ item: await configService.updateProvidersConfig(item) }),
      buildAuditWriteRequest: (result) => ({
        actionType: 'config_changed',
        targetType: 'config',
        targetId: 'providers',
        actorId: request.user?.userId ?? 'unknown-actor',
        actorType: 'human',
        reason: null,
        beforeState: { item: beforeState },
        afterState: result,
        relatedRunId: null,
        relatedReportId: null,
      }),
      auditWriteHelper,
    });
  });

  app.put<{ Body: { item?: unknown } }>('/config/limits', { preHandler: writeRoles }, async (request) => {
    assertObjectBody(request.body);
    assertObjectBody(request.body.item);

    const item = request.body.item as ConfigLimitsDto;
    await validateOrThrow(configService, { limits: item });
    const beforeState = await configService.getLimitsConfig();

    return executeMutationWithRequiredAudit({
      performMutation: async () => ({ item: await configService.updateLimitsConfig(item) }),
      buildAuditWriteRequest: (result) => ({
        actionType: 'config_changed',
        targetType: 'config',
        targetId: 'limits',
        actorId: request.user?.userId ?? 'unknown-actor',
        actorType: 'human',
        reason: null,
        beforeState: { item: beforeState },
        afterState: result,
        relatedRunId: null,
        relatedReportId: null,
      }),
      auditWriteHelper,
    });
  });
}
