export interface ClusterDetails {
  name?: string,
  openshiftVersion?: string,
  kubernetesVersion?: string,
  platform?: string,
  region?: string,
  status: {
    avaliable: boolean,
    reason: string,
  }
  allocatableResources?: {
    cpuCores: number,
    memorySize: string,
    numberOfPods: number,
  }
  avaliableResources?: {
    cpuCores: number,
    memorySize: string,
    numberOfPods: number,
  }
}
