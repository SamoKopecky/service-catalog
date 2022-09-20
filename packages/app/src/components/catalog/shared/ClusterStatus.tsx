import React, { createContext, useContext, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography
} from "@material-ui/core";
import { configApiRef, useApi } from "@backstage/core-plugin-api";
import { useEntity } from "@backstage/plugin-catalog-react";
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from "react-use/lib/useDebounce";
import { ClusterDetails } from "@internal/plugin-cluster-status-backend";
import {
  InfoCard,
  Link,
  Table
} from "@backstage/core-components";
import {
  isError,
  getClusterByName,
  getStatusElement
} from "../../../clusterClient";

const defaultClusterDetails: ClusterDetails = {
  status: {
    available: false,
    reason: 'Loading'
  }
}

const ClusterContext = createContext(defaultClusterDetails);

export const ClusterContextProvider = (props: any) => {
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);
  const [cluster, setCluster] = useState<ClusterDetails>(defaultClusterDetails);
  const [_, refresh] = useAsyncFn(
    async () => {
      let fetchedCluster: ClusterDetails = await getClusterByName(configApi, entity.metadata.name)
      if (isError(fetchedCluster)) {
        fetchedCluster = {
          status: {
            available: false,
            reason: 'Unavaliable'
          }
        }
      }
      setCluster(fetchedCluster)
    }, [], { loading: true }
  );
  useDebounce(refresh, 10);
  return (
    <ClusterContext.Provider value={cluster} >
      {props.children}
    </ClusterContext.Provider>
  )
}

const convertToGibibytes = (kibibytes: string): string => {
  const sizeInKibibytes = parseInt(kibibytes.substring(0, kibibytes.length - 2), 10)
  return `${(sizeInKibibytes / 2 ** 20).toFixed(0)} Gi`
}

const nameFormatter = (name: string): string => (
  name.replace(/[A-Z]/g, v => (` ${v.toLowerCase()}`))
    .replace(/^\w/g, v => v.toUpperCase())
)

const valueFormatter = (value: any): any => {
  if (typeof value === 'string') {
    if (value.slice(-2) === 'Ki') {
      return convertToGibibytes(value)
    } else if (value.slice(0, 4) === 'http') {
      return <Link to={value}>{value}</Link>
    }
  }
  return value.toString()
}

const keyExists = (object: object, key: string): boolean => (
  Object.keys(object).includes(key) ? true : false
)

const tableFromObject = (data: any, title: string,): any => {
  const values = Object.entries(data)
    .reduce((filtered: any, entry) => {
      if (typeof entry[1] !== 'object') {
        filtered.push(
          {
            name: nameFormatter(entry[0]),
            value: valueFormatter(entry[1])
          }
        );
      }
      return filtered;
    }, []);

  if (values.length === 0) {
    return <></>
  }
  return (
    <Card>
      <CardHeader
        title={title}
      />
      <CardContent style={{ padding: 0 }}>
        <Table
          options={{
            search: false,
            paging: false,
            toolbar: false,
            header: false,
            padding: 'dense',
          }}
          data={values}
          columns={[
            { field: 'name', highlight: true, width: '15%', cellStyle: { whiteSpace: 'nowrap' } },
            { field: 'value' },
          ]}
        />
      </CardContent>
    </Card>
  )
}

export const ClusterInfoTable = () => {
  const cluster = useContext(ClusterContext);
  return tableFromObject(cluster, 'Cluster details')
}

export const ClusterAvaliableResourceTable = (): any => {
  const cluster = useContext(ClusterContext);
  return keyExists(cluster, 'availableResources')
    ? tableFromObject(cluster.allocatableResources, 'Available')
    : <></>
}

export const ClusterAllocatableResourceTable = (): any => {
  const cluster = useContext(ClusterContext);
  return keyExists(cluster, 'allocatableResources')
    ? tableFromObject(cluster.allocatableResources, 'Allocatable')
    : <></>
}

export const ClusterStatusCard = (): any => {
  const cluster = useContext(ClusterContext);
  return (
    <InfoCard title="Status" divider={false} >
      <div style={{ textAlign: 'center', margin: 0 }}>
        <Typography variant="h1">
          {getStatusElement(cluster)}
        </Typography>
        <Typography variant="subtitle1">
          {cluster.status.reason}
        </Typography>
      </div>
    </InfoCard>
  )
}
