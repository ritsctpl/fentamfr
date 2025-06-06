// ... existing ApiConfigurationFormData and defaultFormData ...

export interface QualityApprovalProcess {
  name: string;
  version: string;
  entityType: string;
  attachmenttype: string;
  isDefault: boolean;
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
  attachmenttype: "",
  isDefault: false,
  currentVersion: false,
  attachedto: "Test",
  attachedStatus: "Releaseable",
  states: ["Approve"],
  transitions: []
};