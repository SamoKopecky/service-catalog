import React from 'react';
import { Grid } from '@material-ui/core';
import { EntityLayout, EntitySwitch } from '@backstage/plugin-catalog';
import LayoutWrapper from './shared/LayoutWrapper';
import { isType } from './shared/utils';
import {
  EntityTechdocsContent,
  isTechDocsAvailable,
} from '@backstage/plugin-techdocs';
import OverviewWrapper from './shared/OverviewWrapper';
import {
  ClusterAllocatableResourceTable,
  ClusterAvaliableResourceTable,
  ClusterContextProvider,
  ClusterInfoTable,
  ClusterStatusCard,
} from './shared/ClusterStatus';

const resource = (
  <LayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      <OverviewWrapper>
        <Grid item xs={12}>
          <EntitySwitch>
            <EntitySwitch.Case if={isType('cluster')}>
              <ClusterContextProvider>
                <Grid container>
                  <Grid container item direction="column" xs={3}>
                    <Grid item>
                      <ClusterStatusCard />
                    </Grid>
                    <Grid item>
                      <ClusterAllocatableResourceTable />
                    </Grid>
                    <Grid item>
                      <ClusterAvaliableResourceTable />
                    </Grid>
                  </Grid>
                  <Grid item xs>
                    <ClusterInfoTable />
                  </Grid>
                </Grid>
              </ClusterContextProvider>
            </EntitySwitch.Case>
          </EntitySwitch>
        </Grid>
      </OverviewWrapper>
    </EntityLayout.Route>

    <EntityLayout.Route if={isTechDocsAvailable} path="/docs" title="Docs">
      <EntityTechdocsContent />
    </EntityLayout.Route>
  </LayoutWrapper>
);

export default resource;
