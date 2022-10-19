/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { ClusterStatusError } from '../exceptions/ClusterStatusError';
import { StatusCheck } from '../statusCheck/StatusCheck';
import { ClusterDetails, ClusterError } from '../types/types';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

const handleAcmError = (response: any, error: any, logger: Logger) => {
  const acmErrorType = 'acm-cluster-error'
  if (Object.keys(error).includes('body')) {
    const body = error.body
    const toSend: ClusterError = {
      error: {
        name: body?.message,
        type: acmErrorType,
        message: body?.reason,

      },
      response: {
        statusCode: body?.code
      }
    }
    response.status(body?.code).send(toSend)
    logger.error(`${body?.message}; ${JSON.stringify(body)}`)
    return
  }
  // Situation where the error from k8s api call doesn't have a body inside it,
  // That means it probably wasn't an network error and something else happended
  logger.error(`${error}`)
  response.status(500).send({
    error: {
      name: 'unknmown acm error',
      type: acmErrorType,
      message: JSON.stringify(error),
    },
    response: {
      statusCode: 500
    }
  })
}

const handleGeneralError = (response: any, error: any, logger: Logger) => {
  if (error instanceof ClusterStatusError) {
    const toSend: ClusterError = {
      error: {
        name: error.message,
        type: error.type,
        message: error.description,
      },
      response: {
        statusCode: error.statusCode
      }
    }
    response.status(error.statusCode).send(toSend)
    logger.error(`${error.description}; ${error?.stack}`)
    return
  }
  // Handled by default error handler
  // Also prints it to the console
  throw (error)
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  const statusCheck = new StatusCheck(config, logger);

  const router = Router();
  router.use(express.json());
  router.get('/status/:clusterName', ({ params: { clusterName } }, response) => {
    logger.info(`Incoming status request for ${clusterName} cluster`)
    try {
      statusCheck.getClusterStatus(clusterName)
        .then((resp) => {
          response.send(statusCheck.parseStatusCheck(resp.body))
        }).catch((error) => {
          handleAcmError(response, error, logger)
        })
    } catch (error) {
      handleGeneralError(response, error, logger)
    }
  });

  router.get('/status', (_, response) => {
    logger.info(`Incoming status request for all clusters`)
    try {
      statusCheck.getAllClustersStatus()
        .then((resp) => {
          const parsedClusters: Array<ClusterDetails> = resp.body.items
            .map((cluster: any) => (
              statusCheck.parseStatusCheck(cluster)
            ))
          response.send(parsedClusters)
        }).catch((error) => {
          handleAcmError(response, error, logger)
        })
    } catch (error) {
      handleGeneralError(response, error, logger)
    }
  });
  router.use(errorHandler());
  return router;
}
