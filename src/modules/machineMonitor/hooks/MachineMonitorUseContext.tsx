import { createContext } from "react";


interface CombinedContextType {
  formData: object;
  setFormData :(value: Object) => void;
  }
export const MachineMonitorUseContext = createContext<CombinedContextType | undefined>(undefined);