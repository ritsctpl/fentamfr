export interface WorkflowRecord {
  identifier: string;
  messageId: string | null;
  status: string;
  createdDateTime: string | null;
  preprocessJoltResponse: string;
  postProcessJoltResponse: string;
  passHandlerResponse: string | null;
  postProcessApiResponse: string | null;
  apiToProcessResponse: string | null;
  preprocessApiResponse: string | null;
  preprocessXsltResponse: string | null;
  failHandlerResponse: string | null;
  input: string | null;
}