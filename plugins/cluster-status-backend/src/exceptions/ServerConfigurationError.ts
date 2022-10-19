import { ClusterStatusError } from "./ClusterStatusError";

export class ServerConfigurationError extends ClusterStatusError {
  constructor(msg: string, description: string) {
    super(msg, 'server-configuration-error', 500, description);
  }
}
