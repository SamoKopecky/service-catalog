export interface ClusterDetails {
  consoleUrl?: string,
  kubernetesVersion?: string,
  name?: string,
  oauthUrl?: string
  openshiftId?: string
  openshiftVersion?: string,
  platform?: string,
  region?: string,
  allocatableResources?: {
    cpuCores: number,
    memorySize: string,
    numberOfPods: number,
  }
  availableResources?: {
    cpuCores: number,
    memorySize: string,
    numberOfPods: number,
  }
  status: {
    available: boolean,
    reason: string,
  }
}

export interface ClusterError {
  error: {
    name: string,
    type?: string,
    message: string,
    level?: string,
    service?: string,
    stack?: string,
  },
  request?: {
    method?: string,
    url?: string,
  },
  response: {
    statusCode: number
  }
}
