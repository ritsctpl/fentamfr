import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Select, DatePicker, InputNumber, Modal, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { DocumentData, ListData, PrintersData, ResourceTypeData, SubPodData, defaultOperationData, defaultResourceData, defaultWorkCenterData } from '@modules/podMaintenances/types/podMaintenanceTypes';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import { fetchAllDefaultOperation, fetchAllDefaultResource, fetchAllDefaultWorkCenter, fetchAllDocument, fetchAllList, fetchTop50DefaultOperation, fetchTop50DefaultResource, fetchTop50DefaultWorkCenter, fetchTop50Document } from '@services/podMaintenanceService';
import { DynamicBrowse } from '@components/BrowseComponent';
import { fetchAllResourceType, fetchTop50ResourceType } from '@services/workInstructionService';
import { getAllResourcesByResourceType } from '@services/resourceTypeServices';

interface FormValues {
    [key: string]: any;
    description?: string;
    bomType?: string;
    podCategory?: string;
    validFrom?: string;
    validTo?: string;
    status?: string;
    kafkaIntegration?: boolean;
    kafkaId?: string;
    webSocketIntegration?: boolean;
    webSocketUrls?: string[];
    sessionTimeout?: number;
    refreshRate?: number;
    operationCanBeChanged?: boolean;
    resourceCanBeChanged?: boolean;
    showQuantity?: boolean;
    subPod?: string;
    resourceType?: string;
}

interface DynamicFormProps {
    data: any;
    fields: string[];
    onValuesChange: (changedValues: FormValues) => void;
    style?: React.CSSProperties;
}

const { Option } = Select;

const typeOptions = [
    { value: 'Operation', label: 'Operation' },
    { value: 'PCU', label: 'PCU' },
    { value: 'WorkCenter', label: 'WorkCenter' },
    { value: 'SubPod', label: 'SubPod' },
];

const statusOptions = [
    { value: 'Enabled', label: 'Enabled' },
    { value: 'Disabled', label: 'Disabled' },
];

const podCategoryOptions = [
    { value: 'Discrete', label: 'Discrete' },
    { value: 'Process', label: 'Process' },
];

const mainInputHotKeyOptions = [
    { value: 'none', label: 'None' },
    { value: 'ctrl+f1', label: 'Ctrl+F1' },
    { value: 'ctrl+f2', label: 'Ctrl+F2' },
    { value: 'ctrl+f3', label: 'Ctrl+F3' },
    { value: 'ctrl+f4', label: 'Ctrl+F4' },
    { value: 'ctrl+f5', label: 'Ctrl+F5' },
    { value: 'ctrl+f6', label: 'Ctrl+F6' },
    { value: 'ctrl+f7', label: 'Ctrl+F7' },
    { value: 'ctrl+f8', label: 'Ctrl+F8' },
    { value: 'ctrl+f9', label: 'Ctrl+F9' },
    { value: 'ctrl+f10', label: 'Ctrl+F10' },
    { value: 'ctrl+f11', label: 'Ctrl+F11' },
    { value: 'ctrl+f12', label: 'Ctrl+F12' },
    { value: 'shift+f1', label: 'Shift+F1' },
    { value: 'shift+f2', label: 'Shift+F2' },
    { value: 'shift+f3', label: 'Shift+F3' },
    { value: 'shift+f4', label: 'Shift+F4' },
    { value: 'shift+f5', label: 'Shift+F5' }
];
export const uiRecipeBatchProcess: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Phase',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'getPhasesBySite',
    tabledataApi: "recipe-service"
};

const infoLine1Options = [
    { value: 'None', label: 'None' },
    { value: 'Completed Qty', label: 'Completed Qty' },
    { value: 'Non-confirmed Qty', label: 'Non-confirmed Qty' },
    { value: 'active Qty', label: 'Active Qty' },
    { value: 'inQueue Qty', label: 'inQueue Qty' },
    { value: 'Shop Order', label: 'Shop Order' },
    { value: 'Status(SFC)', label: 'Status(SFC)' },
    { value: 'Process Lot', label: 'Process Lot' },
    { value: 'Completion Date', label: 'Completion Date' },
    { value: 'Priority', label: 'Priority' },
    { value: 'Material', label: 'Material' },
];

const infoLine2Options = [
    { value: 'None', label: 'None' },
    { value: 'Completed Qty', label: 'Completed Qty' },
    { value: 'Non-confirmed Qty', label: 'Non-confirmed Qty' },
    { value: 'active Qty', label: 'Active Qty' },
    { value: 'inQueue Qty', label: 'inQueue Qty' },
    { value: 'Shop Order', label: 'Shop Order' },
    { value: 'Status(SFC)', label: 'Status(SFC)' },
    { value: 'Process Lot', label: 'Process Lot' },
    { value: 'Completion Date', label: 'Completion Date' },
    { value: 'Priority', label: 'Priority' },
    { value: 'Material', label: 'Material' },
];

const panelLayoutOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
];

const buttonTypeOptions = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Group', label: 'Group' },
];

const hotKeyOptions = [
    { value: 'Ctrl+G', label: 'Ctrl+G' },
    { value: 'Ctrl+H', label: 'Ctrl+H' },
    { value: 'Ctrl+I', label: 'Ctrl+I' },
    { value: 'Ctrl+J', label: 'Ctrl+J' },
    { value: 'Ctrl+K', label: 'Ctrl+K' },
    { value: 'Ctrl+L', label: 'Ctrl+L' },
];

const imageIconOptions = [
    { value: 'start.png', label: 'Start' },
    { value: 'complete.png', label: 'Complete' },
    { value: 'dc_collect.png', label: 'Dc Collect' },
    { value: 'hold.png', label: 'Hold' },
    { value: 'unhold.png', label: 'Unhold' },
    { value: 'line_clearance.png', label: 'Line Clearance' },
    { value: 'machine_status_change.png', label: 'Machine Status Change' },
    { value: 'scrap.png', label: 'Scrap' },
    { value: 'sign_off.png', label: 'Sign Off' },
    { value: 'work_instruction.png', label: 'Work Instruction' },
    { value: 'pcoTile.png', label: 'PCO Tile' },
    { value: 'pcoGraph.png', label: 'PCO Graph' },
    { value: 'others', label: 'Others...' },
];

const DynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange, style }) => {

    console.log(data, 'data');
    

    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { mainForm, setMainForm, sequence, setSequence, buttonForm } = useContext(PodMaintenanceContext);
    const [kafkaIntegration, setKafkaIntegration] = useState<boolean>(data?.kafkaIntegration);
    const [webSocketIntegration, setWebSocketIntegration] = useState<boolean>(data?.webSocketIntegration);
    const [selectedType, setSelectedType] = useState(data?.type || '');

    console.log(sequence, 'data');
    

    // browse states

    const [defaultOperationVisible, setDefaultOperationVisible] = useState(false);
    const [defaultOperationData, setDefaultOperationData] = useState<defaultOperationData[]>([]);

    const [workCenterVisible, setWorkCenterVisible] = useState(false);
    const [workCenterData, setWorkCenterData] = useState<defaultWorkCenterData[]>([]);

    const [defaultResourceVisible, setDefaultResourceVisible] = useState(false);
    const [defaultResourceData, setDefaultResourceData] = useState<defaultResourceData[]>([]);
    const [defaultPhaseId, setDefaultPhaseId] = useState<string>('');

    const [documentVisible, setDocumentVisible] = useState(false);
    const [documentData, setDocumentData] = useState<DocumentData[]>([]);

    // list options browse

    const [listVisible, setListVisible] = useState(false);
    const [listData, setListData] = useState<ListData[]>([]);
    const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);

    // printers browse
    const [printersVisible, setPrintersVisible] = useState(false);
    const [printersData, setPrintersData] = useState<PrintersData[]>([]);

    // sub pod browse
    const [subPodVisible, setSubPodVisible] = useState(false);
    const [subPodData, setSubPodData] = useState<SubPodData[]>([]);

    const [customImageIcon, setCustomImageIcon] = useState<string>('');
    const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

    const [resourceTypeVisible, setResourceTypeVisible] = useState(false);
    const [resourceTypeData, setResourceTypeData] = useState<ResourceTypeData[]>([]);

    useEffect(() => {
        if (data || mainForm || buttonForm) {
            console.log('call');
            
            const isCustomValue = data?.imageIcon && !imageIconOptions.some(option => option.value === data.imageIcon);
            console.log(isCustomValue, 'isCustomValue');
            

            if (isCustomValue || data?.imageIcon === 'others') {
                console.log('call');
                
                setShowCustomInput(true);
                setCustomImageIcon(data.imageIcon);
                form.setFieldsValue({
                    ...data,
                    imageIcon: 'others' 
                });
            } else {
                setShowCustomInput(false);
                setCustomImageIcon(data?.imageIcon || 'start.png');
            }

            form.setFieldsValue({
                ...data,
                kafkaIntegration: data?.kafkaIntegration || false,
                kafkaId: data?.kafkaId || '',
                webSocketIntegration: data?.webSocketIntegration || false,
                webSocketUrls: data?.webSocketUrls || [],
                sequence: data?.sequence ? data?.sequence : sequence,
                imageIcon: data?.imageIcon || 'start.png',
            });
            setKafkaIntegration(data?.kafkaIntegration || false);
            setWebSocketIntegration(data?.webSocketIntegration || false);
            setSelectedType(data?.type || '');
        }
        setDefaultPhaseId(data?.defaultPhaseId || '');
    }, [data, form, mainForm, sequence, buttonForm]);

    const handleKafkaIntegrationChange = (checked: boolean) => {
        setKafkaIntegration(checked);
        form.setFieldsValue({ kafkaIntegration: checked });
        onValuesChange({ kafkaIntegration: checked });

        if (!checked) {
            form.setFieldsValue({ kafkaId: '' });
        }
    };

    const handleWebSocketIntegrationChange = (checked: boolean) => {
        setWebSocketIntegration(checked);
        form.setFieldsValue({ webSocketIntegration: checked });
        onValuesChange({ webSocketIntegration: checked });
        if (!checked) {
            form.setFieldsValue({ webSocketUrls: [] });
        }
    };

    const handleSwitchChange = (checked: boolean, key: string) => {
        form.setFieldsValue({ [key]: checked });
        onValuesChange({ [key]: checked });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const patterns: { [key: string]: RegExp } = {
            podName: /^[A-Z0-9_]*$/,
            subPod: /^[A-Z0-9_]*$/,
            revision: /^[A-Z0-9_]*$/,
            defaultOperation: /^[A-Z0-9_]*$/,
            defaultWorkCenter: /^[A-Z0-9_]*$/,
            documentName: /^[A-Z0-9_]*$/,
            browseWorkList: /^[A-Z0-9_]*$/,
            podWorkList: /^[A-Z0-9_]*$/,
            assembleList: /^[A-Z0-9_]*$/,
            dcCollectList: /^[A-Z0-9_]*$/,
            operationList: /^[A-Z0-9_]*$/,
            toolList: /^[A-Z0-9_]*$/,
            workInstructionList: /^[A-Z0-9_]*$/,
            dcEntryList: /^[A-Z0-9_]*$/,
            subStepList: /^[A-Z0-9_]*$/,
            defaultResource: /^[A-Z0-9_]*$/,
            pcuQueueButtonID: /^[A-Z0-9_]*$/,
            pcuInWorkButtonID: /^[A-Z0-9_]*$/,
            buttonId: /^[A-Z0-9_]*$/,
            documentPrinter: /^[A-Z0-9_]*$/,
            labelPrinter: /^[A-Z0-9_]*$/,
            travelerPrinter: /^[A-Z0-9_]*$/,
        };

        // Special handling for sessionTimeout and refreshRate
        if (key === 'sessionTimeout' || key === 'refreshRate') {
            form.setFieldsValue({ [key]: e.target.value });
            onValuesChange({ [key]: e.target.value });
            return;
        }

        // Special handling for resourceType and defaultResource
        if (key === 'resourceType' || key === 'defaultResource') {
            const newValue = e.target.value;
            if (!newValue) {
                setDefaultResourceData([]); // Clear defaultResourceData when either field is empty
            }
            form.setFieldsValue({ [key]: newValue });
            onValuesChange({ [key]: newValue });
            if (key === 'defaultResource' && patterns[key]?.test(newValue)) {
                return;
            } else if (key === 'resourceType') {
                return;
            }
        }

        let newValue = e.target.value;

        if (key === 'podName' || key === 'subPod' || key === 'pcuQueueButtonID' || key === 'pcuInWorkButtonID' || key === 'buttonId') {
            newValue = newValue.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        }

        if (patterns[key]?.test(newValue)) {
            form.setFieldsValue({ [key]: newValue });
            onValuesChange({ [key]: newValue });
        }
    };

    const handleDateChange = (date: Dayjs | null, key: string) => {
        const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
        onValuesChange({ [key]: formattedDate });
    };

    const disabledDate = (current: Dayjs) => {
        const validFrom = form.getFieldValue('validFrom');
        if (!validFrom) {
            return false;
        }
        const fromDate = dayjs(validFrom, 'DD-MM-YYYY');
        return current && current.isBefore(fromDate, 'day');
    };

    const handleSubmit = (values: any) => {
        setMainForm(values);
    };

    const handleCancel = () => {
        setDefaultOperationVisible(false);
        setDefaultResourceVisible(false);
        setDocumentVisible(false);
        setListVisible(false);
        setPrintersVisible(false);
        setSubPodVisible(false);
        setWorkCenterVisible(false);
        setResourceTypeVisible(false);
    };

    // default operation

    const handleDefaultOperationClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('defaultOperation');

        const newValue = {
            operation: typedValue,
        }

        try {
            let response;
            if (typedValue) {
                response = await fetchAllDefaultOperation(site, newValue);

            } else {
                response = await fetchTop50DefaultOperation(site);
            }

            if (response && !response.errorCode) {
                const formattedData = response.operationList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setDefaultOperationData(formattedData);
            } else {
                setDefaultOperationData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setDefaultOperationVisible(true);
    };

    const handleDefaultOperationOk = (selectedRow: defaultOperationData | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                defaultOperation: selectedRow.operation,
            });
            onValuesChange({
                defaultOperation: selectedRow.operation.toUpperCase(),
            });
        }

        setDefaultOperationVisible(false);
    };

    const defaultOperationColumn = [
        {
            title: t("operation"),
            dataIndex: "operation",
            key: "operation",
        },
        {
            title: t("revision"),
            dataIndex: "revision",
            key: "revision",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
        {
            title: t("status"),
            dataIndex: "status",
            key: "status",
        },
        {
            title: t("operationType"),
            dataIndex: "operationType",
            key: "operationType",
        },
        {
            title: t("currentVersion"),
            dataIndex: "currentVersion",
            key: "currentVersion",
        },
    ]

    // default work center

    const handleWorkCenterClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('defaultWorkCenter');

        const newValue = {
            workCenter: typedValue,
        }

        try {
            let response;
            if (typedValue) {
                response = await fetchAllDefaultWorkCenter(site, typedValue);
            } else {
                response = await fetchTop50DefaultWorkCenter(site);
            }

            if (response && !response.errorCode) {
                const formattedData = response.workCenterList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setWorkCenterData(formattedData);
            } else {
                setWorkCenterData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setWorkCenterVisible(true);
    };

    const handleWorkCenterOk = (selectedRow: defaultWorkCenterData | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                defaultWorkCenter: selectedRow.workCenter,
            });
            onValuesChange({
                defaultWorkCenter: selectedRow.workCenter.toUpperCase(),
            });
        }

        setWorkCenterVisible(false);
    };

    const workCenterColumn = [
        {
            title: t("workCenter"),
            dataIndex: "workCenter",
            key: "workCenter",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        }
    ]

    // sub pod

    const subData = [
        {
            id: 1,
            subPod: 'SUB1',
            description: 'sub pod 1',
        },
    ]

    const handleSubPodClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('subPod');

        const newValue = {
            operation: typedValue,
        }

        try {
            // let response;
            // if (typedValue) {
            //     response = await fetchAllSubPod(site, newValue);

            // } else {
            //     response = await fetchTop50SubPod(site);
            // }

            // if (response && !response.errorCode) {
            //     const formattedData = response.map((item: any, index: number) => ({
            //         id: index,
            //         ...item,
            //     }));
            //     setSubPodData(formattedData);
            // } else {
            //     setSubPodData([]);
            // }
            setSubPodData(subData);
        } catch (error) {
            console.error('Error', error);
        }

        setSubPodVisible(true);
    };

    const handleSubPodOk = (selectedRow: SubPodData | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                subPod: selectedRow.subPod,
            });
            onValuesChange({
                subPod: selectedRow.subPod.toUpperCase(),
            });
        }

        setSubPodVisible(false);
    };

    const subPodColumn = [
        {
            title: t("subPod"),
            dataIndex: "subPod",
            key: "subPod",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
    ]

    // default resource

    const handleDefaultResourceClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('defaultResource');

        // First check if defaultResourceData is empty
        if (defaultResourceData.length === 0) {
            // If empty, make API call to fetch resources
            const newValue = {
                resource: typedValue,
            }
            try {
                let response;
                if (typedValue) {
                    response = await fetchAllDefaultResource(site, newValue);
                } else {
                    response = await fetchTop50DefaultResource(site);
                }
    
                if (response && !response.errorCode) {
                    const formattedData = response.map((item: any, index: number) => ({
                        id: index,
                        ...item,
                    }));
                    setDefaultResourceData(formattedData);
                } else {
                    setDefaultResourceData([]);
                }
            } catch (error) {
                console.error('Error', error);
            }
        } else {
            // If defaultResourceData has values, filter based on typed value
            if (typedValue) {
                const filteredResources = defaultResourceData.filter((item: any) =>
                    item.resource.toLowerCase().includes(typedValue.toLowerCase())
                );
                setDefaultResourceData(filteredResources);
            }
        }

        setDefaultResourceVisible(true);
    };

    const handleDefaultResourceOk = (selectedRow: defaultResourceData | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                defaultResource: selectedRow.resource,
            });
            onValuesChange({
                defaultResource: selectedRow.resource.toUpperCase(),
            });
        }

        setDefaultResourceVisible(false);
    };

    const defaultResourceColumn = [
        {
            title: t("resource"),
            dataIndex: "resource",
            key: "resource",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
        {
            title: t("status"),
            dataIndex: "status",
            key: "status",
        },
    ]


    // resource type

    const handleResourceTypeClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('resourceType');
        const newValue = { resourceType: typedValue };

        try {
            let response = typedValue ? await fetchAllResourceType(site, newValue) : await fetchTop50ResourceType(site);
            if (response && !response.errorCode) {
                const formattedData = response.map((item: any, index: number) => ({ id: index, ...item }));
                setResourceTypeData(formattedData);
            } else {
                setResourceTypeData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }
        setResourceTypeVisible(true);
    };

    const handleResourceTypeOk = async (selectedRow: ResourceTypeData | undefined) => {
        if (selectedRow) {
            const cookies = parseCookies();
            const site = cookies.site;
            form.setFieldsValue({ resourceType: selectedRow.resourceType });
            onValuesChange({ resourceType: selectedRow.resourceType.toUpperCase() });

            try {
                const response = await getAllResourcesByResourceType(site, { resourceType: selectedRow.resourceType });
                console.log(response, "responseds");
                if (response?.availableResources?.length > 0) {
                    const resourceType = response.availableResources;
                    setDefaultResourceData(resourceType);
                }
                setResourceTypeVisible(false);
            }
            catch (error) {
                console.error('Error', error);
            }
        }
    }

    const ResourceTypeColumn = [
        { title: t("resourceType"), dataIndex: "resourceType", key: "resourceType" },
        { title: t("description"), dataIndex: "resourceTypeDescription", key: "resourceTypeDescription" }
    ];

    // DocumentName

    const handleDocumentClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('documentName');

        const newValue = {
            document: typedValue,
        }

        try {
            let response;
            if (typedValue) {
                response = await fetchAllDocument(site, newValue);
            } else {
                response = await fetchTop50Document(site);
            }
            if (response && !response.errorCode) {
                const formattedData = response.documentResponseList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setDocumentData(formattedData);
            } else {
                setDocumentData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setDocumentVisible(true);
    };

    const handleDocumentOk = (selectedRow: DocumentData | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                documentName: selectedRow.document,
            });
            onValuesChange({
                documentName: selectedRow.document.toUpperCase(),
            });
        }

        setDocumentVisible(false);
    };

    const documentColumn = [
        {
            title: t("document"),
            dataIndex: "document",
            key: "document",
        },
        {
            title: t("version"),
            dataIndex: "version",
            key: "version",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
    ]

    // List tab browse

    const handleListClick = async (key: string) => {
        const cookies = parseCookies();
        const site = cookies.site;

        setSelectedFieldKey(key);

        const categoryMap: { [key: string]: string } = {
            browseWorkList: 'Browse Work List',
            podWorkList: 'POD Work List',
            assembleList: 'Assembly',
            dcCollectList: 'DC Collect',
            operationList: 'Operation',
            toolList: 'Tool',
            workInstructionList: 'Work Instruction',
            dcEntryList: 'DC Entry',
            subStepList: 'Sub Step',
        };

        const category = categoryMap[key];
        if (!category) {
            return;
        }

        const newValue = {
            category,
        };

        try {
            const response = await fetchAllList(site, newValue);

            if (response && !response.errorCode) {
                const formattedData = response.listMaintenanceList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setListData(formattedData);
            } else {
                setListData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setListVisible(true);
    };

    const handleListOk = (selectedRow: ListData | undefined) => {
        if (selectedRow && selectedFieldKey) {
            form.setFieldsValue({
                [selectedFieldKey]: selectedRow.list,
            });

            onValuesChange({
                [selectedFieldKey]: selectedRow.list.toUpperCase(),
            });
        }

        setListVisible(false);
        setSelectedFieldKey(null);
    };

    const ListColumn = [
        {
            title: t("list"),
            dataIndex: "list",
            key: "list",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
        {
            title: t("category"),
            dataIndex: "category",
            key: "category",
        }
    ]

    // printers

    const handlePrintersClick = async (key: string) => {
        const cookies = parseCookies();
        const site = cookies.site;

        setSelectedFieldKey(key);

        const categoryMap: { [key: string]: string } = {
            // documentPrinter: 'Work List',
            // labelPrinter: 'POD Work List',
            // travelerPrinter: 'Assemble',

            documentPrinter: '',
            labelPrinter: '',
            travelerPrinter: '',
        };

        const category = categoryMap[key];
        // if (!category) {
        //     return;
        // }

        const newValue = {
            category,
        };

        try {
            const response = await fetchAllList(site, newValue);
            if (response && !response.errorCode) {
                const formattedData = response.listMaintenanceList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setPrintersData(formattedData);
                setPrintersVisible(true);
            } else {
                setPrintersData([]);
                setPrintersVisible(true);
            }
        } catch (error) {
            console.error('Error', error);
        }

    };

    const handlePrintersOk = (selectedRow: ListData | undefined) => {
        if (selectedRow && selectedFieldKey) {
            form.setFieldsValue({
                [selectedFieldKey]: selectedRow.list,
            });

            onValuesChange({
                [selectedFieldKey]: selectedRow.list.toUpperCase(),
            });
        }

        setPrintersVisible(false);
        setSelectedFieldKey(null);
    };

    const PrintersColumn = [
        {
            title: t("list"),
            dataIndex: "list",
            key: "list",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
        {
            title: t("category"),
            dataIndex: "category",
            key: "category",
        }
    ]
    const handleRecipeBatchProcessChange = (newValues: any[], inputValue1: string) => {
        console.log(newValues, "newValues");
        console.log(inputValue1, "newValues");
        if (newValues.length === 0) {

            onValuesChange({ defaultPhaseId: "" });
            form.setFieldsValue({ defaultPhaseId: "" });
        }
        if (newValues.length > 0) {
            const newValue = inputValue1;
            const newValueSequence = newValues[0].sequence;
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('PhaseIdd', newValue);
            }
            form.setFieldsValue({
                defaultPhaseId: newValue,
            });
            onValuesChange({
                defaultPhaseId: newValue,
            });
        }
    };

    return (
        <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            onValuesChange={(changedValues) => {
                onValuesChange({ ...changedValues });
            }}
            style={style}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
        >
            {fields.map((key) => {
                const value = data?.[key];
                if (value === undefined) {
                    return null;
                }

                const formattedKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());

                switch (key) {
                    case 'panelLayout':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please select ${formattedKey}` }]}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {panelLayoutOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'type':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please select ${formattedKey}` }]}
                            >
                                <Select
                                    defaultValue={value || 'master'}
                                    onChange={(value) => {
                                        setSelectedType(value);
                                        onValuesChange({ type: value });
                                    }}
                                >
                                    {typeOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );


                    case 'buttonType':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please select ${formattedKey}` }]}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {buttonTypeOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'hotKey':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {hotKeyOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'status':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please select ${formattedKey}` }]}
                            >
                                <Select defaultValue={value}>
                                    {statusOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'podCategory':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value}>
                                    {podCategoryOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'mainInputHotKey':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {mainInputHotKeyOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'infoLine1':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {infoLine1Options.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'infoLine2':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {infoLine2Options.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'validFrom':
                    case 'validTo':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    onChange={(date) => handleDateChange(date, key)}
                                    disabledDate={key === 'validTo' ? disabledDate : undefined}
                                />
                            </Form.Item>
                        );

                    case 'kafkaIntegration':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                valuePropName="checked"
                            >
                                <Switch
                                    defaultChecked={value}
                                    onChange={handleKafkaIntegrationChange}
                                />
                            </Form.Item>
                        );

                    case 'resourceType':
                        return (
                            <Form.Item key={key} name={key} label={t(key)}
                            // rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <Input
                                    autoComplete='off'
                                    suffix={<GrChapterAdd onClick={handleResourceTypeClick} />}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'webSocketIntegration':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                valuePropName="checked"
                            >
                                <Switch
                                    defaultChecked={value}
                                    onChange={handleWebSocketIntegrationChange}
                                />
                            </Form.Item>
                        );

                    case 'showQuantity':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                valuePropName="checked"
                            >
                                <Switch
                                    defaultChecked={value}
                                    onChange={(checked) => handleSwitchChange(checked, key)}
                                />
                            </Form.Item>
                        );

                    case 'operationCanBeChanged':
                    case 'resourceCanBeChanged':
                    case 'phaseCanBeChanged':
                        if (key === 'operationCanBeChanged') {
                            return (
                                <Form.Item
                                    key="operationCanBeChanged"
                                    name="operationCanBeChanged"
                                    label={t('operationCanBeChanged')}
                                    labelCol={{ span: 6 }}
                                    wrapperCol={{ span: 18 }}
                                >
                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <Switch
                                            style={{ marginTop: '5px' }}
                                            defaultChecked={data?.operationCanBeChanged}
                                            onChange={(checked) => handleSwitchChange(checked, 'operationCanBeChanged')}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* <span>{t('resourceCanBeChanged')}:</span> */}
                                            <Form.Item
                                                name="resourceCanBeChanged"
                                                label={t('resourceCanBeChanged')}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            // wrapperCol={{ span: 18 }}
                                            >
                                                <Switch
                                                    defaultChecked={data?.resourceCanBeChanged}
                                                    onChange={(checked) => handleSwitchChange(checked, 'resourceCanBeChanged')}
                                                />
                                            </Form.Item>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* <span>{t('phaseCanBeChanged')}:</span> */}
                                            <Form.Item
                                                name="phaseCanBeChanged"
                                                label={t('phaseCanBeChanged')}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Switch
                                                    defaultChecked={data?.phaseCanBeChanged}
                                                    onChange={(checked) => handleSwitchChange(checked, 'phaseCanBeChanged')}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </Form.Item>
                            );
                        }
                        return null;

                    case 'showResource':
                    case 'showOperation':
                    case 'showPhase':
                        if (key === 'showResource') {
                            return (
                                <Form.Item
                                    key="showResource"
                                    name="showResource"
                                    label={t('showResource')}
                                    labelCol={{ span: 6 }}
                                    wrapperCol={{ span: 18 }}
                                >
                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <Switch
                                            style={{ marginTop: '5px' }}
                                            defaultChecked={data?.showResource}
                                            onChange={(checked) => handleSwitchChange(checked, 'showResource')}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* <span>{t('showOperation')}:</span> */}
                                            <Form.Item
                                                name="showOperation"
                                                label={t('showOperation')}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Switch
                                                    defaultChecked={data?.showOperation}
                                                    onChange={(checked) => handleSwitchChange(checked, 'showOperation')}
                                                />
                                            </Form.Item>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* <span>{t('showPhase')}:</span> */}
                                            <Form.Item
                                                name="showPhase"
                                                label={t('showPhase')}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Switch
                                                    defaultChecked={data?.showPhase}
                                                    onChange={(checked) => handleSwitchChange(checked, 'showPhase')}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </Form.Item>
                            );
                        }
                        return null;

                    case 'kafkaId':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={kafkaIntegration ? [{ required: true, message: `Please input ${formattedKey}` }] : []}
                            >
                                <Input
                                    value={value}
                                    type='number'
                                    min={0}
                                    onChange={(e) => handleInputChange(e, key)}
                                    disabled={!kafkaIntegration}
                                />
                            </Form.Item>
                        );

                    case 'webSocketUrls':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={webSocketIntegration ? [{ required: true, message: `Please input ${formattedKey}` }] : []}
                            >
                                <Input.TextArea
                                    value={Array.isArray(value) ? value.join('\n') : value}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        const urlArray = inputValue.split('\n')
                                            .map(url => url.trim())
                                            .filter(url => url !== '');

                                        form.setFieldsValue({ webSocketUrls: urlArray });
                                        onValuesChange({ webSocketUrls: urlArray });
                                    }}
                                    disabled={!webSocketIntegration}
                                    placeholder="Enter WebSocket URLs (one URL per line)"
                                    autoSize={{ minRows: 1, maxRows: 6 }}
                                />
                            </Form.Item>
                        );

                    case 'sequence':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <Input
                                    value={sequence}
                                    type='number'
                                    min={0}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'buttonId':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <Input
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'podName':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <Input
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'description':
                    case 'mainInput':
                    case 'pcuQueueButtonID':
                    case 'pcuInWorkButtonID':
                    case 'buttonLocation':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'imageIcon':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Select
                                        defaultValue={data?.imageIcon || 'start.png'}
                                        style={{ width: showCustomInput ? '50%' : '100%' }}
                                        value={showCustomInput ? 'others' : (imageIconOptions.some(option => option.value === form.getFieldValue('imageIcon'))
                                            ? form.getFieldValue('imageIcon')
                                            : 'start.png')}
                                        onChange={(value) => {
                                            if (value === 'others') {
                                                setShowCustomInput(true);
                                                setCustomImageIcon('');
                                                form.setFieldsValue({ [key]: '' });
                                            } else {
                                                setShowCustomInput(false);
                                                setCustomImageIcon('');
                                                form.setFieldsValue({ [key]: value });
                                                onValuesChange({ [key]: value });
                                            }
                                        }}
                                    >
                                        {imageIconOptions.map(option => (
                                            <Option key={option.value} value={option.value}>
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                    {showCustomInput && (
                                        <Input
                                            style={{ width: '50%' }}
                                            value={customImageIcon}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                setCustomImageIcon(newValue);
                                                form.setFieldsValue({ [key]: newValue });
                                                onValuesChange({ [key]: newValue });
                                            }}
                                            placeholder="Enter custom image icon"
                                        />
                                    )}
                                </div>
                            </Form.Item>
                        );

                    case 'subPod':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleSubPodClick()
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'sessionTimeout':
                    case 'refreshRate':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <InputNumber
                                    value={value}
                                    onChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>, key)}
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        );

                    case 'buttonSize':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <InputNumber
                                    value={value}
                                    onChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>, key)}
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        );

                    case 'buttonLabel':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <Input
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'defaultWorkCenter':
                        return selectedType === 'WorkCenter' ? (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${t(`${key}`)}` }]}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleWorkCenterClick()
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        ) : null;

                    case 'defaultOperation':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${t(`${key}`)}` }]}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleDefaultOperationClick()
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />

                            </Form.Item>
                        );


                    case 'defaultResource':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${t(`${key}`)}` }]}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleDefaultResourceClick()
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />

                            </Form.Item>
                        );

                    case 'defaultPhaseId':
                        if (mainForm?.podCategory?.toLowerCase() === 'process') {
                            return (
                                <Form.Item
                                    key={key}
                                    name={key}
                                    label={t(`${key}`)}
                                    rules={[{ required: true, message: `Please input ${t(`${key}`)}` }]}
                                >
                                    <DynamicBrowse
                                        uiConfig={uiRecipeBatchProcess}
                                        initial={defaultPhaseId}
                                        onSelectionChange={handleRecipeBatchProcessChange}
                                        isDisable={false}
                                    />
                                </Form.Item>
                            );
                        }
                        return null;


                    case 'documentName':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleDocumentClick()
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />

                            </Form.Item>
                        );

                    case 'browseWorkList':
                    case 'podWorkList':
                    case 'assembleList':
                    case 'dcCollectList':
                    case 'operationList':
                    case 'toolList':
                    case 'workInstructionList':
                    case 'dcEntryList':
                    case 'subStepList':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleListClick(key)
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />

                            </Form.Item>
                        );

                    case 'documentPrinter':
                    case 'labelPrinter':
                    case 'travelerPrinter':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handlePrintersClick(key)
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />

                            </Form.Item>
                        );

                    default:
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <Input
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );
                }
            })}


            <Modal
                title={t("selectDefaultOperation")}
                open={defaultOperationVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleDefaultOperationOk(record),
                    })}
                    columns={defaultOperationColumn}
                    dataSource={defaultOperationData}
                    rowKey="opeartion"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal
                title={t("selectDefaultWorkCenter")}
                open={workCenterVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleWorkCenterOk(record),
                    })}
                    columns={workCenterColumn}
                    dataSource={workCenterData}
                    rowKey="workCenter"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal
                title={t("selectDefaultResource")}
                open={defaultResourceVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleDefaultResourceOk(record),
                    })}
                    columns={defaultResourceColumn}
                    dataSource={defaultResourceData}
                    rowKey="resource"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal
                title={t("selectDocumentName")}
                open={documentVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleDocumentOk(record),
                    })}
                    columns={documentColumn}
                    dataSource={documentData}
                    rowKey="document"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal title={t("selectResourceType")} open={resourceTypeVisible} onCancel={handleCancel} width={1000} footer={null}>
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({ onDoubleClick: () => handleResourceTypeOk(record) })}
                    columns={ResourceTypeColumn}
                    dataSource={resourceTypeData}
                    rowKey="resourceType"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal
                title={t("selectList")}
                open={listVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleListOk(record),
                    })}
                    columns={ListColumn}
                    dataSource={listData}
                    rowKey="list"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal
                title={t("selectPrinters")}
                open={printersVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handlePrintersOk(record),
                    })}
                    columns={PrintersColumn}
                    dataSource={printersData}
                    rowKey="list"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal
                title={t("selectSubPod")}
                open={subPodVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleSubPodOk(record),
                    })}
                    columns={subPodColumn}
                    dataSource={subPodData}
                    rowKey="subPod"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>
        </Form>
    );
};

export default DynamicForm;
