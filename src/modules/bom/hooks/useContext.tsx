import { createContext } from "react";
import { BomComponent, BomRequestProps } from "../types/bomTypes";

interface CombinedContextType {
  mainForm: BomRequestProps;
  componentForm: object;
  sequence: number;
  formChange: boolean;
  componentCall: number;
  activeTab: number;
  setMainForm: (value: BomRequestProps) => void;
  setComponentForm: (value: object) => void;
  setSequence: (value: number) => void;
  setFormChange: (value: boolean) => void;
  setComponentCall: (value: number) => void;
  setActiveTab: (value: number) => void;
}

export const BomContext = createContext<CombinedContextType | undefined>(undefined);