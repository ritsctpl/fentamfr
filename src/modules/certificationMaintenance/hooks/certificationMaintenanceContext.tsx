import { createContext } from "react";

interface certificationMaintenanceContextType {
  formData: object;
  formChange: boolean;
  setFormData :(value: Object) => void;
  setFormChange :(value: boolean) => void;
  activeTab: number;
  setActiveTab: (value: number) => void;
  }
export const certificationMaintenanceContext = createContext<certificationMaintenanceContextType | undefined>(undefined);