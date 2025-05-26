export interface ComponentId {
  handle: string;
  label: string;
  dataType: string;
}

export interface SectionType {
  handle: string;
  site: string;
  sectionLabel: string;
  instructions: string;
  effectiveDateTime: string;
  componentIds: ComponentId[];
  userId: string;
  active: number;
  createdDateTime: string;
  modifiedDateTime: string;
  createdBy: string;
  modifiedBy: string;
}

export type ComponentDataType = {
  handle: string;
  componentLabel: string;
  dataType: string;
  defaultValue: string | null;
  required: boolean;
};

export type TemplateDataType = {
  handle: string;
  sectionLabel: string;
  instructions: string;
  effectiveDateTime: string;
};
export const TemplateDefaultData = {
  handle: "",
  sectionLabel: "",
  instructions: "",
  effectiveDateTime: "",
  componentIds: [],
  userId: "",
};

export interface MessageDetails {
  msg_type: string;
  msg?: string;
}

export interface SectionBuilderResponse {
  message_details?: MessageDetails;
  componentList?: any;
  // Add other potential response properties as needed
}
