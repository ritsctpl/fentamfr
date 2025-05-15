export interface NodeData extends Record<string, unknown> {
  label: string;
  revision?: string;
  operationType?: string;
  stepId?: string;
  version?: string;
} 