export abstract class ClusterStatusError extends Error {
  type: string;
  statusCode: number
  description: string;

  constructor(msg: string, type: string, statusCode: number, description: string,) {
    super(msg);
    this.type = type
    this.statusCode = statusCode
    this.description = description;
  }
}
