/* eslint-disable no-nested-ternary */
import React from 'react';
import { Typography } from '@material-ui/core';
import {
  InfoCard,
  StatusAborted,
  StatusError,
  StatusOK,
} from '@backstage/core-components';

import { useCluster } from '../ClusterContext';
import { ClusterDetails } from '@internal/backstage-plugin-rhacm-common';
import { ErrorResponseBody } from '@backstage/errors';

export const ClusterStatusCard = (): any => {
  const { data, loading, error } = useCluster();

  if (error) {
    const status: ClusterDetails = {
      status: {
        available: false,
        reason: (data as unknown as ErrorResponseBody).error.name,
      },
    };
    Object.assign(data, status);
  } else if (loading) {
    data.status.reason = 'Loading';
  }

  return (
    <InfoCard title="Status" divider={false}>
      <div style={{ textAlign: 'center', margin: 0 }}>
        <Typography variant="h1">
          {data.status.available ? (
            <StatusOK />
          ) : !data.status.available && data.status.reason === 'Cluster is down' ? (
            <StatusError />
          ) : (
            <StatusAborted />
          )}
        </Typography>
        <Typography variant="subtitle1">{data.status.reason}</Typography>
      </div>
    </InfoCard>
  );
};
