import { createContext } from "react";


interface CombinedContextType {
  formData: object;
  formChange: boolean;
  setFormData :(value: Object) => void;
  setFormChange :(value: boolean) => void;
  }
export const WorkflowIntegrationUseContext = createContext<CombinedContextType | undefined>(undefined);