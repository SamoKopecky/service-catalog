import { Entity, ResourceEntity } from '@backstage/catalog-model';
import {
  CatalogBuilder,
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
} from '@backstage/plugin-catalog-backend';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { ManagedClusterProvider } from '@janus-idp/backstage-plugin-ocm-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { KeycloakOrgEntityProvider } from '@janus-idp/backstage-plugin-keycloak-backend';

class OpenshiftResourceProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'OpenshiftResourceProcessor';
  }

  async preProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
    originLocation: LocationSpec,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (entity.kind !== 'Resource') {
      return entity;
    }
    const resource = entity as ResourceEntity;
    if (resource.spec.type !== 'kubernetes-cluster') {
      return resource;
    }

    if (originLocation.type === 'rhacm-managed-cluster') {
      resource.metadata.annotations ||= {};
      resource.metadata.annotations['operate-first.cloud/logo-url'] =
        'https://upload.wikimedia.org/wikipedia/commons/3/3a/OpenShift-LogoType.svg';
    }
    return resource;
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  const ocm = ManagedClusterProvider.fromConfig(env.config, {
    logger: env.logger,
  });
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addEntityProvider(ocm);
  builder.addEntityProvider(
    KeycloakOrgEntityProvider.fromConfig(env.config, {
      id: 'development',
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 1 },
        timeout: { minutes: 2 },
        initialDelay: { seconds: 15 },
      }),
    }),
  );
  builder.addProcessor(new OpenshiftResourceProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  await env.scheduler.scheduleTask({
    id: 'run_ocm_refresh',
    fn: async () => {
      await ocm.run();
    },
    frequency: { minutes: 30 },
    timeout: { minutes: 10 },
  });

  return router;
}
