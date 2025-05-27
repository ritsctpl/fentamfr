import moment from "moment";

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
  structureType: "structured" | "unstructured";
  componentIds: ComponentId[];
  userId: string;
  active: number;
  createdDateTime: string;
  modifiedDateTime: string;
  createdBy: string;
  modifiedBy: string;
  style?: {
    marginsEnabled: boolean;
    textAlignment: string;
    tableAlignment: string;
    splitColumns: number;
  };
}

export type ComponentDataType = {
  handle: string;
  componentLabel: string;
  dataType: string;
  defaultValue: string | null;
  required: boolean;
};

export type SectionDataType = {
  handle: string;
  sectionLabel: string;
  instructions: string;
  effectiveDateTime: string;
  structureType?: "structured" | "unstructured";
};

export const SectionDefaultData = {
  handle: "",
  sectionLabel: "",
  instructions: "",
  effectiveDateTime: "",
  structureType: "structured" as const,
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

// If the file contains type definitions for SectionBuilderHeader or SectionBuilderMainPanel props
export interface SectionBuilderHeaderProps {
  selectedSection: SectionDataType | null;
  isPreview: boolean;
  onOpenPreview: () => void;
  onCopySection: () => void;
  onDeleteSection: () => void;
}

export interface SectionBuilderMainPanelProps {
  form: any;
  isLoading: boolean;
  loadingMessage: string;
  selectedSection: SectionDataType | null;
  selectedComponents: (ComponentDataType & { id: string })[];
  sectionFormValues: {
    sectionLabel: string;
    instructions: string;
    effectiveDateTime: string;
    structureType: "structured" | "unstructured";
    componentIds?: any[];
  };
  isPreview: boolean;
  onSectionLabelChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onEffectiveDateChange: (date: moment.Moment | null) => void;
  onStructureTypeChange?: (value: "structured" | "unstructured") => void;
  onDragEnd: (dragIndex: number, dropIndex: number) => void;
  onRemoveComponent: (record: any) => void;
  onClearComponents: () => void;
}
