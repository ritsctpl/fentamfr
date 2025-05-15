import { createContext } from "react";


interface CombinedContextType {
  formData: object;
  setFormData: (value: Object) => void;
  }
export const AuditLogContext = createContext<CombinedContextType | undefined>(undefined);