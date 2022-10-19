import { ClusterStatusError } from "./ClusterStatusError";

export class ClusterNotFound extends ClusterStatusError {
  constructor(msg: string, description?: string) {
    super(msg, 'cluster-not-found', 404, description);
  }
}
