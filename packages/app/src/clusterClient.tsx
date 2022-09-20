import React from "react";
import { StatusAborted, StatusError, StatusOK } from "@backstage/core-components";
import { ConfigApi } from "@backstage/core-plugin-api";
import { ClusterDetails } from "@internal/plugin-cluster-status-backend";


const clusterApiFetchCall = (
  configApi: ConfigApi,
  params: string
): Promise<any> => {
  const backendUrl = configApi.getString('backend.baseUrl');
  const jsonResponse = fetch(`${backendUrl}/api/cluster-status/status${params}`)
    .then(r => r.json())
  return jsonResponse;
}

export const getStatusElement = (cluster: ClusterDetails) => {
  let status = <StatusAborted />
  if (cluster.status.available) {
    status = <StatusOK />
  }
  else if (!cluster.status.available && cluster.status.reason === 'Cluster is down') {
    status = <StatusError />
  }
  return status
}

export const isError = (cluster: ClusterDetails | ClusterDetails[]): boolean => (
  Object.keys(cluster).includes('error')
)

export const getClusters = async (
  configApi: ConfigApi
): Promise<ClusterDetails[]> => (
  clusterApiFetchCall(configApi, '')
)

export const getClusterByName = async (
  configApi: ConfigApi,
  name: string
): Promise<ClusterDetails> => (
  clusterApiFetchCall(configApi, `/${name}`)
)
