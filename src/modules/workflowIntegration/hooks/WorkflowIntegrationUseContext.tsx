import { createContext } from "react";


interface CombinedContextType {
  formData: object;
  formChange: boolean;
  setFormData :(value: Object) => void;
  setFormChange :(value: boolean) => void;
  setRowClick: (value: any) => void;
  rowClick: any;
  }
export const WorkflowIntegrationUseContext = createContext<CombinedContextType | undefined>(undefined);