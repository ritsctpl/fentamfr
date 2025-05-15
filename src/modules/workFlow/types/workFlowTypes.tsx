// ... existing ApiConfigurationFormData and defaultFormData ...

export interface QualityApprovalProcess {
  workFlow: string;
  version: string;
  description: string;
  type: string;
  itemGroup: string;
  enforceSequenceWorkFlow: boolean;
  parallelApproval: boolean;
  emailNotification: boolean;
  createdDateTime: string;
  lastModifiedDateTime: string;
  levelConfigurationList: {
    sequence: number;
    userRole: string;
    user: string;
    status: string;
    finalApproval: boolean;
  }[];
}

export const defaultQualityApprovalProcess: any = {
  workFlow: "",
  version: "",
  description: "",
  itemGroup: "",
  type: "MFR",
  enforceSequenceWorkFlow: true,
  parallelApproval: false,
  emailNotification: false,
  levelConfigurationList: []
};