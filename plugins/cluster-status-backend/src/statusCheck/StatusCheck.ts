import { Config } from "@backstage/config";
import { ClusterDetails } from "../types/types";
import { CustomObjectsApi } from "@kubernetes/client-node"
import { Logger } from 'winston';
import { getCustomObjectsApi } from "./kubernetesApi";

export class StatusCheck {
  acmCluster: string;
  logger: Logger
  config: Config
  api: CustomObjectsApi


  constructor(config: Config, logger: Logger) {
    this.logger = logger
    this.config = config
    this.acmCluster = this.config.getString('clusterStatus.acmCluster')
    this.api = getCustomObjectsApi(this.getAcmClusterFromConfig(), this.logger)
  }

  public getAllClustersStatus = (): Promise<any> => (
    // Empty string means get all clusters
    this.getManagedClusterViaApi('')
  )

  public getClusterStatus = (clusterName: string): Promise<any> => {
    this.checkClusterNames(clusterName);

    let fixedClusterName = clusterName
    if (clusterName === this.acmCluster) {
      fixedClusterName = 'local-cluster'
    }

    return this.getManagedClusterViaApi(fixedClusterName);
  }

  public parseStatusCheck = (managedCluster: any): ClusterDetails => {
    const clusterStatus: any = managedCluster.status
    const avaliable = clusterStatus.conditions.find(
      (value: any) => (value.type === 'ManagedClusterConditionAvailable')
    ).status.toLowerCase() === 'true' ? true : false

    const defaultStatus: ClusterDetails = {
      name: managedCluster.metadata.name,
      status: {
        avaliable: avaliable,
        reason: 'Cluster is up'
      }
    }

    if (!avaliable) {
      defaultStatus.status.reason = 'Cluster is down'
      return defaultStatus;
    }

    const clusterClaims = clusterStatus.clusterClaims
    const allocatable = clusterStatus.allocatable
    const capacity = clusterStatus.capacity
    const parsedClusterInfo = {
      openshiftVersion: this.getClaim(clusterClaims, 'version.openshift.io'),
      kubernetesVersion: this.getClaim(clusterClaims, 'kubeversion.open-cluster-management.io'),
      platform: this.getClaim(clusterClaims, 'platform.open-cluster-management.io'),
      region: this.getClaim(clusterClaims, 'region.open-cluster-management.io'),
      allocatableResources: {
        cpuCores: allocatable.cpu,
        memorySize: allocatable.memory,
        numberOfPods: allocatable.pods,
      },
      avaliableResources: {
        cpuCores: capacity.cpu,
        memorySize: capacity.memory,
        numberOfPods: capacity.pods,
      }
    }

    return {
      ...defaultStatus,
      ...parsedClusterInfo
    }
  }

  private getManagedClusterViaApi = (clusterName: string): Promise<any> => (
    this.api.getClusterCustomObject(
      'cluster.open-cluster-management.io',
      'v1',
      'managedclusters',
      clusterName,
    )
  )

  private getClaim = (clusterClaims: any[], claimName: string): string => (
    clusterClaims.find((value: any) => value.name === claimName).value
  )

  private getAcmClusterFromConfig = (): Config => {
    const clusters = this.getClustersFromConfig();

    const filteredClusters = clusters.filter((value) => (
      value.getString('name') === this.acmCluster
    ));
    if (filteredClusters.length !== 1) {
      this.logger.error(`found number of ACM clusters (${filteredClusters.length}) other then 1`)
      throw new Error()
    }
    return filteredClusters[0];
  }

  private checkClusterNames = (clusterName: string) => {
    const clusters = this.getClustersFromConfig();
    if (clusters.some((value) => (
      value.getString('name') !== clusterName
    ))) {
      throw new Error(`${clusterName} cluster is not contained in the config file`)
    }
  }

  private getClustersFromConfig = (): Config[] => {
    const clusters = this.config.getConfigArray('kubernetes.clusterLocatorMethods')
      .map((value) => {
        const configType = value.getString('type')
        if (configType !== 'config') {
          this.logger.warn(`${configType} is not a supported configuration type`)
          return [];
        }
        return value.getConfigArray('clusters');
      }).flat(1);
    return clusters;
  }

  // TODO: This doesn't work if the clusters have more then one ACM cluster

}
