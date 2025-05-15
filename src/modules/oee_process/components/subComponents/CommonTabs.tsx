import * as React from 'react';
import { Tabs, Select, Switch } from 'antd';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
import Box from '@mui/material/Box';
import { parseCookies } from 'nookies';
import { fetchAllWorkCenter, retrieveWorkCenter } from '@services/oeeServices';
import { useRef, useState } from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}





interface CommonTabsProps {
    tabname: string;
    icon: any;
    component: JSX.Element;
}

interface CommonTabData {
    data: CommonTabsProps[];
    setDeactive: (state: any[]) => void;
    machineToggle: boolean;
    setMachineToggle: (state: boolean) => void;
}

const { TabPane } = Tabs;
const { Option } = Select;

const CommonTabs: React.FC<CommonTabData> = ({ data, setDeactive }) => {
    const { 
        value, 
        setValue, 
        selectedWorkCenter, 
        setSelectedWorkCenter, 
        selectedWorkCenterForMachine, 
        setSelectedWorkCenterForMachine, 
        currentItem, 
        setCurrentItem, 
        refreshCount, 
        setRefreshCount, 
        completeSrcList, 
        completeSrcListForMachine,
        apiCallInProgress,
        machineToggle,
        setMachineToggle,
        refreshCountRef,
        setRefreshCountRef,
        showToggle,
        setShowToggle,
        completeSrcListRef,
        completeSrcListForMachineRef
    } = useFilterContext();
   
    const [workCenterOptions, setWorkCenterOptions] = React.useState<any>();
    
    // Track the last tab index to prevent unnecessary refreshes
    const lastTabIndexRef = useRef(value);

    // Add a state to track if tab change is in progress
    const [tabChangeInProgress, setTabChangeInProgress] = useState(false);
    const [toggleState, setToggleState] = useState({ checked: false, shouldUpdate: false });

    React.useEffect(() => {
        const getWorkCenter = async () => {
            const cookies = parseCookies();
            const site = cookies?.site;
            let getAllWorkCenter = await fetchAllWorkCenter(site, "");
            if(!getAllWorkCenter?.errorCode){
                getAllWorkCenter = getAllWorkCenter.map(item => ({
                    label : item?.workCenter,
                    value : item?.workCenter
                }));
                setWorkCenterOptions(getAllWorkCenter);
            }
        }
        getWorkCenter();
    }, [])

   

    const handleToggleChange = (checked: any) => {
        setMachineToggle(checked);
        setRefreshCountRef(prev => prev + 1);
        setRefreshCount(prev => prev + 1);
    }

    sessionStorage.setItem('activeTabIndex', data[value]?.tabname.toLowerCase());

   
    
    const handleChange = (newValue: string) => {
        const newIndex = parseInt(newValue, 10);
        
        // Skip if the tab hasn't changed, API call is in progress, or tab change is in progress
        if (newIndex === lastTabIndexRef.current || apiCallInProgress || tabChangeInProgress) {
            // console.log(`[TabChange] Skipping change to tab ${newIndex} - Already changing or API in progress`);
            return;
        }
        
        // Mark tab change as in progress
        setTabChangeInProgress(true);
        // console.log(`[TabChange] Starting change to tab ${newIndex}`);
        
        lastTabIndexRef.current = newIndex;
        setValue(newIndex);
        const selectedTab = data[newIndex]?.tabname;
        sessionStorage.setItem('activeTabIndex', selectedTab.toLowerCase());

        // Add a slight delay before triggering the refresh
        setTimeout(() => {
            try {
                if (newIndex === 0 && selectedWorkCenter?.length > 0) {
                    handleSelectChange(selectedWorkCenter);
                } else if (newIndex === 6 && selectedWorkCenterForMachine?.length > 0) {
                    handleSelectChangeForMachine(selectedWorkCenterForMachine);
                } else {
                    setRefreshCount(prev => prev + 1);
                }
            } finally {
                // Always mark tab change as complete
                setTimeout(() => {
                    setTabChangeInProgress(false);
                    // console.log(`[TabChange] Completed change to tab ${newIndex}`);
                }, 300);
            }
        }, 100);
    };

   

    const handleSelectChange1 = async (selectedItems: string[]) => {
        const cookies = parseCookies();
        const site = cookies?.site;

        if (!selectedItems?.length) {
            setSelectedWorkCenter([]);
            setCurrentItem([]);
            return;
        }

        setSelectedWorkCenter(selectedItems);
    
        try {
            const responses = await Promise.all(
                selectedItems.map(async (item) => {
                    return await retrieveWorkCenter(site, item);
                })
            );
    
            console.log("Complete SRC list: ", completeSrcListRef.current)
            if (Array.isArray(responses) && responses.length > 0) {
                const allAssociationLists = responses.map(response => response?.associationList).flat();
                const associateIds = allAssociationLists.map(item => item?.associateId);
                
                if (associateIds?.length && completeSrcListRef.current?.length) {
                    const filteredItems = completeSrcListRef.current.filter(item => 
                        associateIds?.some(id => id === item?.resource)
                    );
                    setCurrentItem(filteredItems);
                }
            }
            setRefreshCount(prev => prev + 1);
        } catch (error) {
            console.error("Error retrieving work centers:", error);
        }
    };


    const handleSelectChange = async (selectedItems: string[]) => {
        // console.log('Selected items:', selectedItems);
        const cookies = parseCookies();
        const site = cookies?.site;
    
        if (selectedItems != undefined && selectedItems != null) {
            selectedItems ? setSelectedWorkCenter(selectedItems) : setSelectedWorkCenter([]);
        }
    
        try {
            // Make multiple API calls based on selectedItems
            const responses = await Promise.all(
                selectedItems.map(async (item) => {
                    return await retrieveWorkCenter(site, item); // Pass the item to the API call
                })
            );
    
            // Handle the responses as needed
            // console.log("Responses from retrieveWorkCenter:", responses);
            if (Array.isArray(responses) && responses.length > 0) {
                // debugger
                const allAssociationLists = responses.map(response => response?.associationList).flat();
            
                // Extract associateIds from the association list
                const associateIds = allAssociationLists.map(item => item?.associateId);
                // Filter currentItem based on the associateIds
                const filteredItems = completeSrcList.filter(item => associateIds?.some(id => id === item?.resource));
                // console.log("filteredItems", filteredItems)
                // Set the filtered items to resourceList
                setCurrentItem(filteredItems);
               
                // setResourceList(filteredItems);
            }
            setRefreshCount(refreshCount + 1);

        } catch (error) {
            console.error("Error retrieving work centers:", error);
            // Handle the error as needed (e.g., show a notification to the user)
        }
    

        // console.log("Current item data: ", currentItem);
    };
    
    const handleSelectChangeForMachine = async (selectedItems: string[]) => {
        // console.log('Selected items:', selectedItems);
        const cookies = parseCookies();
        const site = cookies?.site;
    
        if (selectedItems != undefined && selectedItems != null) {
            selectedItems ? setSelectedWorkCenterForMachine(selectedItems) : setSelectedWorkCenterForMachine([]);
        }
    
        try {
            // Make multiple API calls based on selectedItems
            const responses = await Promise.all(
                selectedItems.map(async (item) => {
                    return await retrieveWorkCenter(site, item); // Pass the item to the API call
                })
            );
    
            // Handle the responses as needed
            // console.log("Responses from retrieveWorkCenter:", responses);
            if (Array.isArray(responses) && responses.length > 0) {
                // debugger
                const allAssociationLists = responses.map(response => response?.associationList).flat();
            
                // Extract associateIds from the association list
                const associateIds = allAssociationLists.map(item => item?.associateId);
                // Filter currentItem based on the associateIds
                const filteredItems = completeSrcListForMachine.filter(item => associateIds?.some(id => id === item?.resource));
                // console.log("filteredItems", filteredItems)
                // Set the filtered items to resourceList
                setCurrentItem(filteredItems);
               
                // setResourceList(filteredItems);
            }
            setRefreshCount(refreshCount + 1);

        } catch (error) {
            console.error("Error retrieving work centers:", error);
            // Handle the error as needed (e.g., show a notification to the user)
        }
    

        // console.log("Current item data: ", currentItem);
    };

    

    
    
       

    return (
        <Box sx={{ width: '100%'}}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider',background:"white", width: '100%' }}>
            <Tabs
                activeKey={value.toString()}
                onChange={handleChange}
                tabBarStyle={{ background: 'white', borderBottom: '1px solid #e8e8e8', marginLeft: '10px' }}
                tabBarExtraContent={
                    <>
                       { showToggle == true && (
                            <>
                            <span style={{ marginRight: "8px", fontSize: "12px", color: "#555", fontWeight: "bold" }}>
                                Machine Data :
                            </span>
                            <Switch
                                checked={machineToggle}
                                onChange={handleToggleChange}
                                style={{
                                    backgroundColor: machineToggle ? "var(--button-color)" : "grey",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    marginRight: "10px",
                                }}
                            />
                            </>
                       )
                         }       

                        {value === 0 && (
                            <Select
                                mode="multiple"
                                style={{ width: 200, marginRight: '20px' }}
                                placeholder="Select Work Center"
                                onChange={handleSelectChange}
                                maxTagCount={1}
                                allowClear
                                value={selectedWorkCenter} 
                            >
                                {workCenterOptions?.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        )}
                        {value === 6 && (
                            <Select
                                mode="multiple"
                                style={{ width: 200, marginRight: '20px' }}
                                placeholder="Select Work Center"
                                onChange={handleSelectChangeForMachine}
                                maxTagCount={1}
                                allowClear
                                value={selectedWorkCenterForMachine} 
                            >
                                {workCenterOptions?.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </>
                }
            >
                {data.map((item, index) => (
                    <TabPane
                        tab={
                            <span style={{ color: '#000', fontFamily: 'roboto' }}>
                                {item.icon}
                                {item.tabname}
                            </span>
                        }
                        key={index.toString()}
                    >
                        {item.component}
                    </TabPane>
                ))}
            </Tabs>
        </Box>
    </Box>
    );
};

export default React.memo(CommonTabs);
