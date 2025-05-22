export type SectionBuilderDatatable = Array<{
  sectionLabel: string;
  effectiveDateTime: string;
}>;

export interface ComponentIds {
  id?: string | number;
  handle: string;
  label: string;
  dataType: string;
}

export interface SectionBuilderDataItem {
  site: string;
  sectionLabel: string;
  instructions: string;
  effectiveDateTime: string;
  componentIds: ComponentIds[];
  userId: string;
}

export const defaulSectionBuilderform: SectionBuilderDataItem = {
  site: "",
  sectionLabel: "",
  instructions: "",
  effectiveDateTime: "",
  componentIds: [],
  userId: "",
};

//components api types

export type componentsDataType = Array<{
  handle: string;
  componentId: string;
  componentsLabel: string;
  dataType: string;
  defaultValue: string;
  required: boolean;
}>;
