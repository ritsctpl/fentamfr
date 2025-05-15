export interface ServiceExtensionType {
  activityHookId: string;
  description: string;
  targetClass: string;
  targetMethod: string;
  hookType: string;
  hookPoint: string;
  hookClass: string;
  hookMethod: string;
  executionMode: string;
  site: string;
  attachmentList: [];
}


export const defaultHookType: ServiceExtensionType = {
  site: "",
  description: "",
  targetClass: "",
  activityHookId: "",
  targetMethod: "",
  hookType: "",
  hookPoint: "Pre Start",
  hookClass: "",
  hookMethod: "",
  executionMode: "Async",
  attachmentList: []
};