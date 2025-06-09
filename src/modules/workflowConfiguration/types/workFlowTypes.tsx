// ... existing ApiConfigurationFormData and defaultFormData ...

export interface QualityApprovalProcess {
  name: string;
  version: string;
  entityType: string;
  attachmenttype: string;
  default: boolean;
  currentVersion: boolean;
  attachedto: any;
  attachedStatus: any;
  states: any;
  transitions: any
}

export const defaultConfiguration: any = {
  name: "",
  version: "",
  entityType: "MFR",
  attachmenttype: "Export",
  default: false,
  currentVersion: true,
  attachedto: "Item",
  attachedStatus: "Releaseable",
  states: ["Approve"],
  transitions: []
};