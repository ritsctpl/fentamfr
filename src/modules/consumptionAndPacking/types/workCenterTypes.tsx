export interface ActivityHook {
  hookPoint: string;
  activity: string;
  enable: boolean;
  userArgument: string;
}

export interface Association {
  sequence: string;
  type: string;
  associateId: string;
  status: string;
  defaultResource: boolean;
}

export interface CustomData {
  customData: string;
  value: string;
}

export interface WorkCenterData {
  site: string;
  workCenter: string;
  userId: string;
  description: string;
  status: string;
  routing: string;
  routingVersion: string;
  activityHookList: ActivityHook[];
  workCenterCategory: string;
  defaultParentWorkCenter: string;
  erpWorkCenter: string;
  associationList: Association[];
  customDataList: CustomData[];
}

const defaultWorkCenterData: WorkCenterData = {
  site: "",
  workCenter: "",
  userId: "",
  description: "",
  status: "Available",
  routing: "",
  routingVersion: "",
  activityHookList: [

  ],
  workCenterCategory: "Cell",
  defaultParentWorkCenter: "",
  erpWorkCenter: "",
  associationList: [

  ],
  customDataList: [

  ],
};

