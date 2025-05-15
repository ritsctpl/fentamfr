import { createContext, useContext } from "react";

interface PayrollContextType {
  }
export const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const MyProvider = ({ children }) => {
  return (
    <PayrollContext.Provider value={{}}>
      {children}
    </PayrollContext.Provider>
  );
}

export const usePayrollContext = () => {
    return useContext(PayrollContext);
  };