export interface Task {
  key: string;
  taskId: string;
  taskName: string;
  taskDescription: string;
  isMandatory: boolean;
  evidenceRequired: boolean;
}

export interface AssociatedTo {
  key: string;
  workcenterId: string;
  resourceId: string;
  enable: boolean;
}

export interface UserRole {
  key: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}
export interface ChecklistTemplate {
  site: string;
  templateName: string;
  description: string;
  clearanceTimeLimit: string;
  notifyOnCompletion: boolean;
  maxPendingTasks: string;
  clearanceReminderInterval: string;
  enablePhotoEvidence: boolean;
  associatedTo: AssociatedTo[];
  tasks: Task[];
  userRoles: UserRole[];
  createdDateTime: string;
  modifiedDateTime: string | null;
}

export const defaultLineClearanceTemplate: ChecklistTemplate = {
  site: "",
  templateName: "",
  description: "",
  clearanceTimeLimit: "",
  notifyOnCompletion: false,
  maxPendingTasks: "",
  clearanceReminderInterval: "",
  enablePhotoEvidence: false,
  associatedTo: [],
  tasks: [],
  userRoles: [],
  createdDateTime: "",
  modifiedDateTime: null,
};
