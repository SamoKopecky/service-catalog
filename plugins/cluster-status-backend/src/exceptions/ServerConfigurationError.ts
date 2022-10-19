import { ClusterStatusError } from "./ClusterStatusError";

export class ServerConfigurationError extends ClusterStatusError {
<<<<<<< HEAD
  constructor(msg: string, description: string) {
=======
  constructor(msg: string, description?: string) {
>>>>>>> 66094c6 (feat: Create new error handler)
    super(msg, 'server-configuration-error', 500, description);
  }
}
