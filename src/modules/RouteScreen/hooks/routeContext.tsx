import { createContext, useContext, useEffect, useState } from "react";

interface RouteContextType {
    formData: any;
    setFormData: (formData: any) => void;
}

export const RouteContext = createContext<RouteContextType| undefined>(undefined);

export const RouteProvider = ({ children }: { children: React.ReactNode }) => {
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        console.log(formData);
    }, [formData]);

    return <RouteContext.Provider value={{ formData, setFormData }}>{children}</RouteContext.Provider>;
};
    
export const useRoute = () => {
    const context = useContext(RouteContext);
    if (!context) {
        throw new Error('useRoute must be used within a RouteProvider');
    }
    return context;
};
