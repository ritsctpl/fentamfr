import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Select, message } from 'antd';
import { WidgetRenderer } from './WidgetRenderer';
import { DashboardWidget, ApiConfig, QueryConfig } from './types';
import { executeApiCall, executeQueryCall } from './utils/apiHandler';
import CommonAppBar from '@components/CommonAppBar';

interface SavedDashboard {
    name: string;
    widgets: Record<string, DashboardWidget>;
    savedAt: string;
}

const DashboardViewer: React.FC = () => {
    const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
    const [selectedDashboard, setSelectedDashboard] = useState<SavedDashboard | null>(null);
    const [widgetData, setWidgetData] = useState<Record<string, any>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [formSubmissions, setFormSubmissions] = useState<Record<string, any>>({});

    useEffect(() => {
        // Load saved dashboards from localStorage
        const dashboards = JSON.parse(localStorage.getItem('savedDashboards') || '[]');
        setSavedDashboards(dashboards);
        
        // If there's at least one dashboard, select the first one by default
        if (dashboards.length > 0) {
            setSelectedDashboard(dashboards[dashboards.length - 1]);
        }
    }, []);

    const handleDashboardChange = (dashboardName: string) => {
        const dashboard = savedDashboards.find(d => d.name === dashboardName);
        if (dashboard) {
            setSelectedDashboard(dashboard);
            setWidgetData({}); // Clear previous widget data
            message.success(`Loaded dashboard: ${dashboardName}`);
        }
    };


    const handleDataUpdate = useCallback((widgetId: string, newData: any, widget: DashboardWidget) => {
        const updateType = widget.props?.formSubmit?.updateType || 'data';

        // Add logging to track data updates
        console.log('Data update in DashboardViewer:', {
            widgetId,
            updateType,
            newData,
            dataType: typeof newData,
            isArray: Array.isArray(newData),
            dataLength: Array.isArray(newData) ? newData.length : 0
        });

        setWidgetData(prev => {
            const newWidgetData = { ...prev };

            switch (updateType) {
                case 'text':
                    // Update text content for text components
                    if (selectedDashboard?.widgets[widgetId]) {
                        selectedDashboard.widgets[widgetId] = {
                            ...selectedDashboard.widgets[widgetId],
                            props: {
                                ...selectedDashboard.widgets[widgetId].props,
                                text: newData.text || JSON.stringify(newData)
                            }
                        };
                    }
                    break;

                case 'props':
                    // Update specific props
                    if (selectedDashboard?.widgets[widgetId]) {
                        selectedDashboard.widgets[widgetId] = {
                            ...selectedDashboard.widgets[widgetId],
                            props: {
                                ...selectedDashboard.widgets[widgetId].props,
                                ...newData
                            }
                        };
                    }
                    break;

                case 'data':
                default:
                    const processedData = Array.isArray(newData) ? newData :
                        (typeof newData === 'object' && newData !== null) ? [newData] : [];
                    
                    // Log processed data
                    console.log('Processed data:', {
                        widgetId,
                        processedDataLength: processedData.length,
                        processedData
                    });

                    if (processedData.length > 0) {
                        const firstItem = processedData[0];
                        const newColumns = Object.keys(firstItem).map(key => ({
                            title: key.charAt(0).toUpperCase() + key.slice(1)
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/_/g, ' '), // Also handle underscores
                            dataIndex: key,
                            key: key
                        }));

                        newWidgetData[widgetId] = {
                            data: processedData,
                            columns: newColumns
                        };
                    } else {
                        newWidgetData[widgetId] = {
                            data: [],
                            columns: []
                        };
                    }
                    break;
            }

            // Log final widget data
            console.log('Final widget data:', {
                widgetId,
                dataLength: newWidgetData[widgetId]?.data?.length,
                data: newWidgetData[widgetId]?.data
            });

            return newWidgetData;
        });
    }, [selectedDashboard]);

    const handleApiCall = useCallback(async (widgetId: string, apiConfig: ApiConfig, formValues?: any) => {
        try {
            setLoadingStates(prev => ({ ...prev, [widgetId]: true }));

            // Get form values either from direct submission or stored values
            let effectiveFormValues = formValues;
            if (!effectiveFormValues && apiConfig.bodySource?.type === 'form') {
                effectiveFormValues = formSubmissions[apiConfig.bodySource.formId];
            }

            console.log('Making API call with:', {
                widgetId,
                apiConfig,
                formValues: effectiveFormValues,
                storedFormValues: formSubmissions
            });

            const response = await executeApiCall(apiConfig, effectiveFormValues);
            
            // Get the widget that initiated the API call
            const sourceWidget = selectedDashboard?.widgets[widgetId];
            
            // Get the target component ID from flowConnect
            const targetComponentId = sourceWidget?.props?.flowConnect?.targetComponent;
            
            if (targetComponentId) {
                // Update the target component
                console.log('Updating target component:', targetComponentId, response);
                handleDataUpdate(targetComponentId, response, selectedDashboard?.widgets[targetComponentId]);
            } else {
                // If no target component specified, update the source component
                console.log('Updating source component:', widgetId, response);
                handleDataUpdate(widgetId, response, sourceWidget);
            }
        } catch (error) {
            console.error('API call failed:', error);
            message.error('Failed to fetch data');
        } finally {
            setLoadingStates(prev => ({ ...prev, [widgetId]: false }));
        }
    }, [formSubmissions, handleDataUpdate, selectedDashboard?.widgets]);

    const handleQueryCall = useCallback(async (widgetId: string, queryConfig: QueryConfig, formValues?: any) => {
        try {
            setLoadingStates(prev => ({ ...prev, [widgetId]: true }));

            // Get form values either from direct submission or stored values
            let effectiveFormValues = formValues;
            if (!effectiveFormValues && queryConfig.bodySource?.type === 'form') {
                effectiveFormValues = formSubmissions[queryConfig.bodySource.formId];
            }

            console.log('Making Query call with:', {
                widgetId,
                queryConfig,
                formValues: effectiveFormValues,
                storedFormValues: formSubmissions
            });

            const response = await executeQueryCall(queryConfig, effectiveFormValues);
            
            // Get the widget that initiated the Query call
            const sourceWidget = selectedDashboard?.widgets[widgetId];
            
            // Get the target component ID from flowConnect
            const targetComponentId = sourceWidget?.props?.flowConnect?.targetComponent;
            
            if (targetComponentId) {
                // Update the target component
                console.log('Updating target component:', targetComponentId, response);
                handleDataUpdate(targetComponentId, response, selectedDashboard?.widgets[targetComponentId]);
            } else {
                // If no target component specified, update the source component
                console.log('Updating source component:', widgetId, response);
                handleDataUpdate(widgetId, response, sourceWidget);
            }
        } catch (error) {
            console.error('Query call failed:', error);
            message.error('Failed to fetch data');
        } finally {
            setLoadingStates(prev => ({ ...prev, [widgetId]: false }));
        }
    }, [formSubmissions, handleDataUpdate, selectedDashboard?.widgets]);

    // Update handleFormSubmit to handle both API and Query configurations
    const handleFormSubmit = useCallback(async (formId: string, values: any) => {
        console.log('Form submitted in DashboardViewer:', {
            formId,
            values,
            currentFormSubmissions: formSubmissions
        });
    
        // Update form submissions state
        setFormSubmissions(prev => {
            const newFormSubmissions = {
                ...prev,
                [formId]: values
            };
            console.log('Updated form submissions:', newFormSubmissions);
            return newFormSubmissions;
        });

        // Handle both API and Query calls for components using this form
        Object.entries(selectedDashboard?.widgets || {}).forEach(async ([widgetId, widget]) => {
            const apiConfig = widget.props?.flowConnect?.api;
            const queryConfig = widget.props?.flowConnect?.query;

            // Handle API configurations
            if (apiConfig?.bodySource?.type === 'form' && apiConfig.bodySource.formId === formId) {
                await handleApiCall(widgetId, apiConfig, values);
            }

            // Handle Query configurations
            if (queryConfig?.bodySource?.type === 'form' && queryConfig.bodySource.formId === formId) {
                await handleQueryCall(widgetId, queryConfig, values);
            }
        });
    }, [selectedDashboard?.widgets, handleApiCall, handleQueryCall]);

    // Update handleWidgetClick to handle both API and Query
    const handleWidgetClick = useCallback(async (widgetId: string) => {
        const widget = selectedDashboard?.widgets[widgetId];
        if (widget?.props?.flowConnect?.type === 'onClick') {
            if (widget.props.flowConnect.api) {
                await handleApiCall(widgetId, widget.props.flowConnect.api);
            }
            if (widget.props.flowConnect.query) {
                await handleQueryCall(widgetId, widget.props.flowConnect.query);
            }
        }
    }, [selectedDashboard, handleApiCall, handleQueryCall]);

    // Update handleWidgetHover to handle both API and Query
    const handleWidgetHover = useCallback(async (widgetId: string) => {
        const widget = selectedDashboard?.widgets[widgetId];
        if (widget?.props?.flowConnect?.type === 'onHover') {
            if (widget.props.flowConnect.api) {
                await handleApiCall(widgetId, widget.props.flowConnect.api);
            }
            if (widget.props.flowConnect.query) {
                await handleQueryCall(widgetId, widget.props.flowConnect.query);
            }
        }
    }, [selectedDashboard, handleApiCall, handleQueryCall]);

    // Update the useEffect for onPageLoad to handle both API and Query
    useEffect(() => {
        if (selectedDashboard) {
            Object.entries(selectedDashboard.widgets).forEach(([widgetId, widget]) => {
                if (widget.props?.flowConnect?.type === 'onPageLoad') {
                    const apiConfig = widget.props.flowConnect.api;
                    const queryConfig = widget.props.flowConnect.query;

                    if (apiConfig) {
                        const formValues = apiConfig.bodySource?.formId ? 
                            formSubmissions[apiConfig.bodySource.formId] : 
                            undefined;
                        handleApiCall(widgetId, apiConfig, formValues);
                    }

                    if (queryConfig) {
                        const formValues = queryConfig.bodySource?.formId ? 
                            formSubmissions[queryConfig.bodySource.formId] : 
                            undefined;
                        handleQueryCall(widgetId, queryConfig, formValues);
                    }
                }
            });
        }
    }, [selectedDashboard?.name, handleApiCall, handleQueryCall, formSubmissions]);

    const renderWidgetTree = useCallback((parentId: string | null = null) => {
        return Object.values(selectedDashboard?.widgets || {})
            .filter(widget => widget.parentId === parentId && !widget.props?.hidden)
            .map(widget => (
                <WidgetRenderer
                    key={widget.id}
                    name={selectedDashboard?.name}
                    id={widget.id}
                    type={widget.type}
                    style={{
                        position: parentId ? 'relative' : 'absolute',
                        left: parentId ? 0 : widget.position.x,
                        top: parentId ? 0 : widget.position.y,
                        ...widget.props?.style
                    }}
                    onWidgetClick={() => handleWidgetClick(widget.id)}
                    onWidgetHover={() => handleWidgetHover(widget.id)}
                    loading={loadingStates[widget.id]}
                    dataSource={widgetData[widget.id]?.data}
                    columns={widgetData[widget.id]?.columns}
                    isEditMode={false}
                    onFormSubmit={widget.type === 'form' ? 
                        (values) => handleFormSubmit(widget.id, values) : 
                        undefined
                    }
                    {...widget.props}
                    formData={formSubmissions}
                    allComponents={selectedDashboard?.widgets}
                >
                    {renderWidgetTree(widget.id)}
                </WidgetRenderer>
            ));
    }, [selectedDashboard?.widgets, widgetData, loadingStates, handleWidgetClick, handleWidgetHover, handleFormSubmit, formSubmissions]);

    return (
        <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* <CommonAppBar
                onSearchChange={() => {}}
                allActivities={[]}
                username={''}
                site={''}
                appTitle={'Dashboard Viewer'}
                onSiteChange={() => setCall(call + 1)}
            /> */}
            {/* <div style={{ padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #e8e8e8' }}>
                <Select
                    style={{ width: 300 }}
                    placeholder="Select a dashboard"
                    value={selectedDashboard?.name}
                    onChange={handleDashboardChange}
                    options={savedDashboards.map(d => ({ label: d.name, value: d.name }))}
                />
            </div> */}
            <div style={{ 
                flex: 1, 
                position: 'relative',
                backgroundColor: '#f5f5f5',
                // padding: '20px',
                overflow: 'auto'
            }}>
                {selectedDashboard ? (
                    renderWidgetTree()
                ) : (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        height: '100%',
                        color: '#666'
                    }}>
                        {savedDashboards.length === 0 ? 
                            'No dashboards found. Create one in the Dashboard Creator.' : 
                            'Select a dashboard to view'}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DashboardViewer; 