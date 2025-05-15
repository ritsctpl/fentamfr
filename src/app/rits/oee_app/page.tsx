"use client"
import OeeAnalytics from "@modules/oee_process/components/OeeAnalytics"
import { MyProvider } from "@modules/oee_process/hooks/filterData"


const OeeApp = () => {
    return(
        <MyProvider>
        <OeeAnalytics />;
        </MyProvider>)
}

export default OeeApp