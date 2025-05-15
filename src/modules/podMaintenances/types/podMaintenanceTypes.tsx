export interface defaultOperationData {
  id: number;
  operation: string;
  revision: string;
  description: string;
  status: string;
  operationType: string;
  currentVersion: string;
}

export interface defaultWorkCenterData {
  id: number;
  workCenter: string;
  description: string;
  status: string;
  operationType: string;
  currentVersion: string;
}

export interface ResourceTypeData {
  id: number;
  resourceType: string;
  description: string;
}

export interface defaultResourceData {
  id: number;
  resource: string;
  description: string;
  status: string;
}

export interface DocumentData {
  id: number;
  document: string;
  version: string;
  description: string;
}

export interface ListData {
  id: number;
  list: string;
  description: string;
  category: string;
}

export interface PrintersData {
  id: number;
  list: string;
  description: string;
  category: string;
}

export interface SubPodData {
  id: number;
  subPod: string;
  description: string;
}

export interface Activity {
  activitySequence?: string;
  activity?: string;
  type?: string;
  url?: string;
  pluginLocation?: string;
  clearsPcu?: boolean;
  fixed?: boolean;
}

export interface RButton {
  sequence?: any;
  buttonType?: string;
  buttonId?: string;
  buttonLabel?: string;
  buttonSize?: string;
  imageIcon?: string;
  hotKey?: string;
  buttonLocation?: string;
  startNewButtonRow?: boolean;
  activityList?: Activity[];
}

export interface ListOption {
  browseWorkList?: string;
  podWorkList?: string;
  assembleList?: string;
  dcCollectList?: string;
  operationList?: string;
  toolList?: string;
  workInstructionList?: string;
  dcEntryList?: string;
  subStepList?: string;
}

export interface PodSelection {
  mainInput?: string;
  mainInputHotKey?: string;
  defaultOperation?: string;
  defaultPhaseId?: string;
  defaultResource?: string;
  pcuQueueButtonID?: string;
  pcuInWorkButtonID?: string;
  infoLine1?: string;
  infoLine2?: string;
  showOperationFirst?: boolean;
  showQuantity?: boolean;
  operationCanBeChanged?: boolean;
  resourceCanBeChanged?: boolean;
}

export interface Printers {
  documentPrinter?: string;
  labelPrinter?: string;
  travelerPrinter?: string;
}

export interface CustomData {
  customData?: string;
  value?: string;
}

export interface PrePhaseList {
  key?: string;
  activitySequence?: string;
  activity?: string;
  type?: string;
  description?: string;
  url?: string;
  pluginLocation?: number;
}

export interface PostPhaseList {
  key?: string;
  activitySequence?: string;
  activity?: string;
  type?: string;
  description?: string;
  url?: string;
  buttons?: string;
}

export interface PanelPlugin {
  activity: string;
  activityDescription: string;
}

export interface LayoutPanel {
  panel: string;
  type: "fixed" | "popup";
  defaultPlugin: string;
  otherPlugin: PanelPlugin[];
}

export interface Settings {
  PCUOrBatchNumberBrowseActivity: string;
  podWorkListActivity: string;
  onTabOutOfOperation: {
    reloadWorkList: boolean;
    reloadResource: boolean;
  };
  onTabOutOfWorkCenter: {
    reloadWorkList: boolean;
    reloadResource: boolean;
  };
  onTabOutOfResource: {
    reloadWorkList: boolean;
    reloadResource: boolean;
  };
  updateFieldsToSession: {
    operation: boolean;
    resource: boolean;
    batchNumber: boolean;
    order: boolean;
    recipe: boolean;
    item: boolean;
  };
  buttonLocation: string;
  buttonActivityInWork: string[];
  buttonActivityInQueue: string[];
  serviceButtonActivityInQueue: string;
  serviceButtonActivityInWork: string;
}

export interface PodRequest {
  site?: string;
  type?: string;
  podName?: string;
  description?: string;
  status?: string;
  displayDevice?: string;
  displaySize?: string;
  ncClient?: string;
  realTimeMessageDisplay?: string;
  specialInstructionDisplay?: string;
  panelLayout?: string;
  kafkaIntegration?: boolean;
  kafkaId?: string;
  sessionTimeout?: string;
  refreshRate?: string;
  defaultOperation?: string;
  defaultPhaseId?: string;
  phaseCanBeChanged?: boolean;
  showResource?: boolean;
  showOperation?: boolean;
  showPhase?: boolean;
  defaultWorkCenter?: string;
  defaultResource?: string;
  resourceType?: string;
  soundWithErrorMessage?: boolean;
  showHomeIcon?: boolean;
  showHelpIcon?: boolean;
  showLogoutIcon?: boolean;
  autoExpandMessageArea?: boolean;
  operationCanBeChanged?: boolean;
  resourceCanBeChanged?: boolean;
  showQuantity?: boolean;
  pcuQueueButtonId?: string;
  pcuInWorkButtonId?: string;
  documentName?: string;
  buttonList?: RButton[];
  tabConfiguration?: {
    prePhaseList: PrePhaseList[];
    postPhaseList: PostPhaseList[];
  };
  listOptions?: ListOption[];
  podSelection?: PodSelection[];
  printers?: Printers[];
  customDataList?: CustomData[];
  settings?: Settings;
  active?: number;
  createdDateTime?: string;
  modifiedDateTime?: string;
  userId?: string;
  subPod?: string;
  webSocketIntegration?: boolean;
  webSocketUrls?: string[];

  podCategory?: string;
  // settings?: {
  //   PCUOrBatchNumberBrowseActivity?: string;
  //   podWorkListActivity?: string;
  //   onTabOutOfOperation?: {
  //     reloadWorkList: boolean;
  //     reloadResource: boolean;
  //   };
  //   onTabOutOfWorkCenter?: {
  //     reloadWorkList: boolean;
  //     reloadResource: boolean;
  //   };
  //   onTabOutOfResource?: {
  //     reloadWorkList: boolean;
  //     reloadResource: boolean;
  //   };
  //   updateFieldsToSession?: {
  //     operation: boolean;
  //     resource: boolean;
  //     batchNumber: boolean;
  //     order: boolean;
  //     recipe: boolean;
  //     item: boolean;
  //   };
  //   buttonActivityInWork?: string[];
  //   buttonActivityInQueue?: string[];
  //   serviceButtonActivityInQueue?: string;
  //   serviceButtonActivityInWork?: string;
  // };
  layout?: LayoutPanel[];
}

// Default values
export const defaultActivity: Activity = {
  activitySequence: '',
  activity: '',
  type: '',
  url: '',
  pluginLocation: '',
  clearsPcu: false,
  fixed: false,
};

export const defaultRButton: RButton = {
  sequence: '',
  buttonType: 'Normal',
  buttonId: '',
  buttonLabel: '',
  buttonSize: '',
  imageIcon: 'start.png',
  hotKey: 'Ctrl+G',
  buttonLocation: '',
  startNewButtonRow: false,
  activityList: [],
};

export const defaultListOption: ListOption = {
  browseWorkList: '',
  podWorkList: '',
  assembleList: '',
  dcCollectList: '',
  operationList: '',
  toolList: '',
  workInstructionList: '',
  dcEntryList: '',
  subStepList: '',
};

export const defaultPodSelection: PodSelection = {
  mainInput: '',
  mainInputHotKey: 'None',
  defaultOperation: '',
  defaultPhaseId: '',
  defaultResource: '',
  pcuQueueButtonID: '',
  pcuInWorkButtonID: '',
  infoLine1: '',
  infoLine2: '',
  showOperationFirst: false,
  showQuantity: false,
  operationCanBeChanged: false,
  resourceCanBeChanged: false,
};

export const defaultPrinters: Printers = {
  documentPrinter: '',
  labelPrinter: '',
  travelerPrinter: '',
};

export const defaultCustomData: CustomData = {
  customData: '',
  value: '',
};

export const defaultSettings: Settings = {
  PCUOrBatchNumberBrowseActivity: '',
  podWorkListActivity: '',
  onTabOutOfOperation: {  
    reloadWorkList: false,
    reloadResource: false
  },
  onTabOutOfWorkCenter: {
    reloadWorkList: false,
    reloadResource: false
  },
  onTabOutOfResource: {
    reloadWorkList: false,
    reloadResource: false
  },
  updateFieldsToSession: {
    operation: true,
    resource: true,
    batchNumber: true,
    order: false,
    recipe: false,
    item: false
  },
  buttonLocation: 'left',
  buttonActivityInWork: [],
  buttonActivityInQueue: [],
  serviceButtonActivityInQueue: '',
  serviceButtonActivityInWork: ''
};

// First, define the default panel layout structure
export const defaultLayoutPanel: LayoutPanel = {
  panel: "",
  type: "popup",
  defaultPlugin: "",
  otherPlugin: [
    {
      activity: "",
      activityDescription: ""
    }
  ]
};

// Update the defaultPodRequest to include a function that sets layout based on panelLayout
export const getDefaultLayout = (panelLayout: string): LayoutPanel[] => {
  const numPanels = parseInt(panelLayout) || 1;
  return Array(numPanels).fill(null).map((_, index) => ({
    ...defaultLayoutPanel,
    panel: `Panel${index + 1}`
  }));
};

export const defaultPodRequest: PodRequest = {
  site: '',
  type: 'Operation',
  podName: '',
  description: '',
  status: 'Enabled',
  displayDevice: '',
  displaySize: '',
  ncClient: '',
  realTimeMessageDisplay: '',
  specialInstructionDisplay: '',
  panelLayout: '1',
  kafkaIntegration: false,
  kafkaId: '',
  sessionTimeout: '',
  refreshRate: '',
  defaultOperation: '',
  defaultPhaseId: '',
  phaseCanBeChanged: false,
  showResource: false,
  showOperation: false,
  showPhase: false,
  defaultWorkCenter: '',
  defaultResource: '',
  resourceType: '',
  soundWithErrorMessage: false,
  showHomeIcon: false,
  showHelpIcon: false,
  showLogoutIcon: false,
  autoExpandMessageArea: false,
  operationCanBeChanged: false,
  resourceCanBeChanged: false,
  showQuantity: false,
  pcuQueueButtonId: '',
  pcuInWorkButtonId: '',
  documentName: '',
  buttonList: [],
  tabConfiguration: {
    prePhaseList: [],
    postPhaseList: []
  },
  listOptions: [defaultListOption],
  podSelection: [defaultPodSelection],
  printers: [defaultPrinters],
  customDataList: [defaultCustomData],
  active: 0,
  createdDateTime: '',
  modifiedDateTime: '',
  userId: '',
  subPod: '',



  podCategory: 'Discrete',
  settings: defaultSettings,
  webSocketIntegration: false,
  webSocketUrls: [],
  // settings: {
  //   PCUOrBatchNumberBrowseActivity: '',
  //   podWorkListActivity: '',
  //   onTabOutOfOperation: {
  //     reloadWorkList: false,
  //     reloadResource: false
  //   },
  //   onTabOutOfWorkCenter: {
  //     reloadWorkList: false,
  //     reloadResource: false
  //   },
  //   onTabOutOfResource: {
  //     reloadWorkList: false,
  //     reloadResource: false
  //   },
  //   updateFieldsToSession: {
  //     operation: true,
  //     resource: true,
  //     batchNumber: true,
  //     order: false,
  //     recipe: false,
  //     item: false
  //   },
  //   buttonActivityInWork: [],
  //   buttonActivityInQueue: [],
  //   serviceButtonActivityInQueue: '',
  //   serviceButtonActivityInWork: ''
  // },
  layout: getDefaultLayout('1'),  // This will create one default panel
};

// You can also create a function to update layout when panelLayout changes
export const updateLayoutBasedOnPanelLayout = (podRequest: PodRequest): PodRequest => {
  return {
    ...podRequest,
    layout: getDefaultLayout(podRequest.panelLayout || '1')
  };
};

