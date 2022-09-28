import { ConfigApi } from "@backstage/core-plugin-api";
import { ClusterDetails } from "@internal/plugin-cluster-status-backend";

export const getClusters = async (configApi: ConfigApi): Promise<ClusterDetails[]> => {
  return clusterApiFetchCall(configApi, '')
}

export const getClusterByName = async (configApi: ConfigApi, name: string): Promise<ClusterDetails> => {
  return clusterApiFetchCall(configApi, `/${name}`)
}

const clusterApiFetchCall = (configApi: ConfigApi, params: string): Promise<any> => {
  const backendUrl = configApi.getString('backend.baseUrl');
  const jsonResponse = fetch(`${backendUrl}/api/cluster-status/status${params}`).then(r => r.json())
  return jsonResponse;
}
