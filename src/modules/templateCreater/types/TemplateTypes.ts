export interface TemplateListItem {
  templateLabel: string;
  templateType: string;
  templateVersion: string;
  currentVersion: boolean;
}

export interface GroupId {
  handle: string;
  label: string;
}

export interface TemplateDetails {
  handle: string;
  templateLabel: string;
  templateType: string;
  templateVersion: string;
  currentVersion: boolean;
  productGroup: string;
  groupIds: GroupId[];
  site: string;
  active: number;
  userId: string;
  createdDateTime: string;
  updatedDateTime: string;
}

export type BuilderType = 'Group' | 'Section' | 'Component';

export interface ComponentItem {
  handle: string;
  componentLabel: string;
  componentType: string;
  dataType: string;
}

export interface SectionItem {
  handle: string;
  sectionLabel: string;
  sectionType: string;
}

export interface GroupItem {
  handle: string;
  groupLabel: string;
  groupType: string;
}

export interface ItemGroupResponse {
  errorCode?: string;
  groupNameList: Array<{
    itemGroup: string;
    groupDescription: string;
  }>;
} 