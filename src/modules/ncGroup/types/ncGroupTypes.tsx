

export interface NcGroupType {
  site: string;
  ncGroup: string;
  userId: string;
  description: string;
  ncGroupFilterPriority: string;
  ncCodeDPMOCategoryList: NcCodeDPMOCategory[];
  validAtAllOperations: boolean;
  operationList: Operation[];
}

export interface NcCodeDPMOCategory {
  ncCode: string;
}

export interface Operation {
  operation: string;
}

export const defaultNcGroupType: NcGroupType = {
  site: "",
  ncGroup: "",
  userId: "",
  description: "",
  ncGroupFilterPriority: "",
  ncCodeDPMOCategoryList: [],
  validAtAllOperations: false,
  operationList: []
};