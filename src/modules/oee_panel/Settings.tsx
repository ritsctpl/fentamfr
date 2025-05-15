import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { Button, Input, message, Segmented, Select, Space, Switch, ConfigProvider, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useConfigContext } from './hooks/configData';
import type { CategoryData, ChartData, ManagementData } from './hooks/configData';
import type { InputRef } from 'antd';
import Checker from './Checker';
import { DynamicBrowse } from '@components/BrowseComponent';
import { ProTable } from '@ant-design/pro-components';
import enUS from 'antd/locale/en_US';
import { getSampleData } from '@services/oeeServices';
import JsonFormatter from './components/JsonFormatter';
import { fetchAllQueryBuilder, fetchQueryBuilder } from '@services/queryBuilderService';
import { parseCookies } from 'nookies';

// Custom hooks for state management
const useModalState = (initialState = false) => {
    const [isVisible, setIsVisible] = useState(false);
    const [data, setData] = useState<any>(null);
    const [name, setName] = useState('');
    const [isNew, setIsNew] = useState(true);

    const show = useCallback((newData = null, isNewDashboard = true) => {
        setIsVisible(true);
        if (newData) setData(newData);
        setIsNew(isNewDashboard);
    }, []);

    const hide = useCallback(() => {
        setIsVisible(false);
        setData(null);
        setName('');
    }, []);

    return {
        isVisible,
        data,
        name,
        isNew,
        setName,
        setData,
        show,
        hide
    };
};

const useTableState = () => {
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(8);
    const [isAddingRow, setIsAddingRow] = useState(false);
    const [localChanges, setLocalChanges] = useState<Record<string, any>>({});
    useEffect(() => {
        document.onfullscreenchange = () => {
            setPageSize(document.fullscreenElement ? 15 : 8);
        };
    }, []);

    return {
        searchText,
        setSearchText,
        pageSize,
        setPageSize,
        isAddingRow,
        setIsAddingRow,
        localChanges,
        setLocalChanges
    };
};

// Utility functions
const generateUniqueId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const randomPart = Math.random().toString(16).substring(2, 10);
    return `${timestamp}${randomPart}`;
};

const initialRowData: ChartData = {
    dataName: '',
    type: 'bar',
    query: '',
    endPoint: '',
    enabled: true,
    seconds: '5',
    column: '12',
    colorScheme: {
        lineColor: [],
        itemColor: []
    }
};

const Settings: React.FC = () => {
    const site = parseCookies()?.site;
    const config = useConfigContext();
    const [selectedSegment, setSelectedSegment] = useState<string>();
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState<string>('');
    const [newRowData, setNewRowData] = useState<ChartData>(initialRowData);
    const inputRef = useRef<InputRef>(null);
    const [queryBuilder, setQueryBuilder] = useState<any[]>([]);
    const {
        searchText,
        setSearchText,
        pageSize,
        isAddingRow,
        setIsAddingRow,
        localChanges,
        setLocalChanges
    } = useTableState();

    const previewModal = useModalState();
    const versionModal = useModalState();

    // Effects
    useEffect(() => {
        if (config.value?.[0]?.dashBoardDataList?.length > 0 && !selectedSegment) {
            setSelectedSegment(config.value[0].dashBoardDataList[0].category);
        }
    }, [config.value, selectedSegment]);

    useEffect(() => {
        if (versionModal.isVisible && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [versionModal.isVisible]);

    useEffect(() => {
        fetchAllQueryBuilder(site).then(res => {
            setQueryBuilder(res);
        });
    }, [site]);

    // Handlers
    const handleLocalChange = useCallback((key: string, field: string, newValue: any) => {
        setLocalChanges(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || {}),
                [field]: newValue
            }
        }));
    }, []);

    useEffect(() => {
        const updateTimeout = setTimeout(() => {
            if (!config.value?.[0] || Object.keys(localChanges).length === 0) return;

            const categoryData = config.value[0].dashBoardDataList.find(
                cat => cat.category === selectedSegment
            );

            if (categoryData) {
                const updatedData = categoryData.data.map(item => ({
                    ...item,
                    ...localChanges[item.dataName]
                }));

                const newConfig = {
                    ...config.value[0],
                    dashBoardDataList: config.value[0].dashBoardDataList.map(cat =>
                        cat.category === categoryData.category
                            ? { ...cat, data: updatedData }
                            : cat
                    )
                };

                config.setValue([newConfig]);
            }
        }, 1000);

        return () => clearTimeout(updateTimeout);
    }, [localChanges, config, selectedSegment]);

    const handleSaveChanges = useCallback(async () => {
        try {
            if (!config.value?.[0]) return;
            await config.updateData(config.value[0]);
            setLocalChanges({});
            message.success('Changes saved successfully');
        } catch (error) {
            console.error('Error saving changes:', error);
            message.error('Failed to save changes');
        }
    }, [config]);

    const handleShowModal = useCallback(async (key: string, type: string) => {
        const categoryData = config.value[0].dashBoardDataList.find(
            cat => cat.category === selectedSegment
        );
        const record = categoryData?.data.find(item => item.dataName === key);

        if (!record) return;

        previewModal.show();
        previewModal.setName(record[type === 'endPoint' ? 'endPoint' : 'query']);

        try {
            const data = type === 'endPoint'
                ? await getSampleData(record.endPoint, { site })
                : await fetchQueryBuilder({ templateName: record.query, site });
            previewModal.setData(data);
        } catch (error) {
            previewModal.setData(error);
        }
    }, [config.value, selectedSegment, site]);

    const handleDelete = useCallback(async (cat: CategoryData) => {
        const categoryIndex = config.value[0].dashBoardDataList.findIndex(
            (c) => c.category === cat.category
        );
        if (categoryIndex > 0) {
            setSelectedSegment(config.value[0].dashBoardDataList[categoryIndex - 1].category);
        } else {
            setSelectedSegment(config.value[0].dashBoardDataList[0].category);
        }
        try {
            if (config.value.length > 0) {
                const currentData = { ...config.value[0] };
                currentData.dashBoardDataList = currentData.dashBoardDataList.filter(
                    (c) => c.category !== cat.category
                );
                await config.updateData(currentData);
                message.success('Category deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            message.error('Failed to delete category');
        }
    }, [config, setSelectedSegment]);

    const handleAddRow = useCallback(async (cat: CategoryData) => {
        setIsAddingRow(true);
        setNewRowData((prev) => ({ ...prev, dataName: '' }));
    }, [generateUniqueId]);

    const handleSaveNewRow = useCallback(async (cat: CategoryData) => {
        try {
            if (config.value.length > 0) {
                const currentData = { ...config.value[0] };
                const categoryIndex = currentData.dashBoardDataList.findIndex(
                    (c) => c.category === cat.category
                );

                if (categoryIndex !== -1) {
                    const updatedCategoryData = {
                        ...currentData.dashBoardDataList[categoryIndex],
                        data: [...currentData.dashBoardDataList[categoryIndex].data, newRowData]
                    };

                    const updatedData = {
                        ...currentData,
                        dashBoardDataList: currentData.dashBoardDataList.map((c, i) =>
                            i === categoryIndex ? updatedCategoryData : c
                        )
                    };

                    await config.updateData(updatedData);
                    setIsAddingRow(false);
                    setNewRowData(initialRowData);
                    message.success('New row added successfully');
                }
            }
        } catch (error) {
            console.error('Error adding row:', error);
            message.error('Failed to add row');
        }
    }, [config, newRowData, initialRowData]);

    const handleDeleteRow = useCallback(async (key: string) => {
        try {
            if (config.value.length > 0) {
                const categoryData = config.value[0].dashBoardDataList.find(cat =>
                    cat.data.some(item => item.dataName === key)
                );
                if (categoryData) {
                    const updatedCategoryData = {
                        ...categoryData,
                        data: categoryData.data.filter(item => item.dataName !== key)
                    };

                    const updatedManagementData = {
                        ...config.value[0],
                        dashBoardDataList: config.value[0].dashBoardDataList.map(cat =>
                            cat.category === categoryData.category ? updatedCategoryData : cat
                        )
                    };

                    await config.updateData(updatedManagementData);
                    message.success('Row deleted successfully');
                }
            }
        } catch (error) {
            console.error('Error deleting row:', error);
            message.error('Failed to delete row');
        }
    }, [config]);

    const handleVersionModalState = useCallback((type: 'new' | 'copy', visible: boolean) => {
        if (!visible) {
            versionModal.hide();
            return;
        }

        versionModal.show(null, type === 'new');
        versionModal.setName('');
    }, [versionModal]);

    const handleVersionAction = useCallback(async () => {
        const { name: dashboardName, isNew } = versionModal;

        try {
            if (!dashboardName.trim()) {
                message.error('Please enter a dashboard name');
                return;
            }

            let newVersion: ManagementData;
            if (isNew) {
                newVersion = {
                    site: site || 'RITS',
                    user: '',
                    dashBoardName: dashboardName,
                    dashBoardDataList: [],
                    filterDataList: []
                };
            } else {
                const currentData = config.value[0];
                newVersion = {
                    site: currentData.site,
                    user: currentData.user,
                    dashBoardName: dashboardName,
                    dashBoardDataList: currentData.dashBoardDataList.map(category => ({
                        category: category.category,
                        enabled: category.enabled,
                        data: category.data.map(item => ({
                            dataName: item.dataName,
                            type: item.type,
                            query: item.query,
                            endPoint: item.endPoint,
                            enabled: item.enabled,
                            seconds: item.seconds,
                            column: item.column,
                            colorScheme: item.colorScheme || {
                                lineColor: [],
                                itemColor: []
                            }
                        }))
                    })),
                    filterDataList: currentData.filterDataList.map(filter => ({
                        filterName: filter.filterName,
                        type: filter.type,
                        status: filter.status,
                        keyName: filter.keyName || '',
                        controller: filter.controller,
                        endpoint: filter.endpoint,
                        retriveFeild: filter.retriveFeild
                    }))
                };
            }

            const createdVersion = await config.createData(newVersion);
            config.setValue([createdVersion, ...config.value]);
            versionModal.hide();
            message.success(`Dashboard ${createdVersion.dashBoardName} ${isNew ? 'created' : 'copied'} successfully`);
        } catch (error) {
            console.error('Error managing version:', error);
            message.error('Failed to manage version');
        }
    }, [config, versionModal, site]);

    const handleAddCategory = useCallback(async () => {
        try {
            if (config.value.length > 0) {
                const tempCategory = '';
                const newCategoryData = {
                    id: generateUniqueId(),
                    createdAt: new Date().toISOString(),
                    category: tempCategory,
                    data: [],
                    enabled: true
                };

                const updatedManagementData = {
                    ...config.value[0],
                    dashBoardDataList: [...config.value[0].dashBoardDataList, newCategoryData]
                };

                config.setValue([updatedManagementData]);
                setSelectedSegment(tempCategory);
                setEditingCategory(tempCategory);
                setEditingValue(tempCategory);
            }
        } catch (error) {
            console.error('Error adding category:', error);
            message.error('Failed to add category');
        }
    }, [config, generateUniqueId, setSelectedSegment]);

    const handleCategoryChange = async (newValue: string) => {
        if (!newValue.trim()) {
            message.error('Category name cannot be empty');
            setEditingCategory(null);
            config.setValue([{
                ...config.value[0],
                dashBoardDataList: config.value[0].dashBoardDataList.filter(cat => cat.category !== '' && cat.category !== 'New Category')
            }]);
            return;
        }

        try {
            if (config.value.length > 0) {
                const categoryData = config.value[0].dashBoardDataList.find(cat => cat.category === editingCategory);
                if (categoryData) {
                    const updatedCategoryData = {
                        ...categoryData,
                        category: newValue.trim()
                    };

                    const updatedManagementData = {
                        ...config.value[0],
                        dashBoardDataList: config.value[0].dashBoardDataList.map(cat =>
                            cat.category === categoryData.category ? updatedCategoryData : cat
                        )
                    };

                    config.setValue([updatedManagementData]);
                    await config.updateData(updatedManagementData);
                    setSelectedSegment(newValue.trim());
                }
                setEditingCategory(null);
            }
        } catch (error) {
            console.error('Error updating category:', error);
            message.error('Failed to update category');
        }
    };

    const handleCategoryDoubleClick = (cat: string) => {
        setEditingCategory(cat);
        setEditingValue(cat);
    };

    const renderSegmentOption = (cat: string) => {
        if (editingCategory === cat) {
            return (
                <Input
                    size="small"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onPressEnter={() => handleCategoryChange(editingValue)}
                    onBlur={() => handleCategoryChange(editingValue)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    style={{ width: '100px' }}
                    placeholder="Enter category name"
                />
            );
        }
        return (
            <span onDoubleClick={() => handleCategoryDoubleClick(cat)}>
                {cat}
            </span>
        );
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'dataName',
            key: 'dataName',
            width: '20%',
            render: (text: string, record: any) => {
                const value = localChanges[record.dataName]?.dataName ?? text;
                return (
                    <Input
                        style={{ width: '100%' }}
                        value={value === "-" ? "" : value}
                        onChange={(e) => handleLocalChange(record.dataName, 'dataName', e.target.value)}
                    />
                );
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text: string, record: any) => {
                const value = localChanges[record.dataName]?.type ?? text;
                return (
                    <Select
                        value={value}
                        className='custom-selectt'
                        style={{ width: '100%' }}
                        onChange={async (value) => {
                            const isValid = await Checker(record, value);
                            if (true) {
                                handleLocalChange(record.dataName, 'type', value);
                            } else {
                                message.error('This is not a valid data for this chart type pick another chart type');
                            }
                        }}
                        options={[
                            { value: 'bar', label: 'Bar' },
                            { value: 'line', label: 'Line' },
                            { value: 'timeline', label: 'Timeline' },
                            { value: 'pie', label: 'Pie' },
                            { value: 'stack', label: 'Stack' },
                            { value: 'pareto', label: 'Pareto' },
                            { value: 'gauge', label: 'Gauge' },
                            { value: 'speedGauge', label: 'Speed Gauge' },
                            { value: 'area', label: 'Area' },
                            { value: 'heatmap', label: 'Heatmap' },
                            { value: 'table', label: 'Table' },
                            { value: 'tile', label: 'Tile' }
                        ]}
                    />
                );
            }
        },
        {
            title: 'Query',
            dataIndex: 'query',
            key: 'query',
            width: '20%',
            render: (text: string, record: any) => {
                const value = localChanges[record.dataName]?.query ?? text;
                return (
                    <Select
                        showSearch
                        value={value === "-" ? "" : value}
                        className='custom-select'
                        style={{ width: '100%' }}
                        onChange={(value) => {
                            handleLocalChange(record.dataName, 'query', value);
                        }}
                        options={queryBuilder.map(item => ({
                            value: item.templateName,
                            label: item.templateName
                        }))}
                    />
                );
            }
        },
        {
            title: 'End Point',
            dataIndex: 'endPoint',
            key: 'endPoint',
            width: '15%',
            render: (text: string, record: any) => {
                const value = localChanges[record.dataName]?.endPoint ?? text;
                return (
                    <Input
                        value={value === "-" ? "" : value}
                        onChange={(e) => handleLocalChange(record.dataName, 'endPoint', e.target.value)}
                        suffix={
                            <EyeOutlined onClick={() => handleShowModal(record.dataName, 'endPoint')} />
                        }
                    />
                );
            }
        },
        {
            title: 'Seconds',
            dataIndex: 'seconds',
            key: 'seconds',
            render: (text: string, record: any) => {
                const value = localChanges[record.dataName]?.seconds ?? text;
                return (
                    <Input
                        value={value === "-" ? "" : value}
                        style={{ width: '100%' }}
                        onChange={(e) => handleLocalChange(record.dataName, 'seconds', e.target.value)}
                    />
                );
            }
        },
        {
            title: 'Column',
            dataIndex: 'column',
            key: 'column',
            render: (text: string, record: any) => {
                const value = localChanges[record.dataName]?.column ?? text;
                return (
                    <Select
                        value={value}
                        options={[
                            { label: '1', value: '24' },
                            { label: '1.5', value: '16' },
                            { label: '2', value: '12' },
                            { label: '3', value: '8' },
                            { label: '4', value: '6' },
                        ]}
                        onChange={(value) => handleLocalChange(record.dataName, 'column', value)}
                    />
                );
            }
        },
        {
            title: 'Enabled',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (checked: boolean, record: any) => {
                const value = localChanges[record.dataName]?.enabled ?? checked;
                return (
                    <Switch
                        checked={value}
                        size='small'
                        style={{ backgroundColor: value ? '#124561' : '#cbcbcb' }}
                        onChange={(checked) => handleLocalChange(record.dataName, 'enabled', checked)}
                    />
                );
            }
        },
        {
            title: 'Delete',
            dataIndex: 'delete',
            key: 'delete',
            render: (_: any, record: any) => (
                <Button
                    icon={<DeleteOutlined />}
                    size='small'
                    danger
                    onClick={() => handleDeleteRow(record.dataName)}
                />
            )
        },
    ];

    const selectedCategoryData = useMemo(() => {
        if (!config.value?.[0]?.dashBoardDataList) return [];
        const categoryData = config.value[0].dashBoardDataList.find(cat => cat.category === selectedSegment)?.data || [];

        const dataWithKeys = categoryData.map(item => ({
            ...item,
            key: item.dataName
        }));

        if (searchText) {
            const text = searchText.toLowerCase();
            return dataWithKeys.filter(item =>
                item.dataName.toLowerCase().includes(text) ||
                item.type.toLowerCase().includes(text) ||
                item.query.toLowerCase().includes(text) ||
                item.endPoint.toLowerCase().includes(text)
            );
        }
        return dataWithKeys;
    }, [config.value, selectedSegment, searchText]);

    if (!config) {
        return null;
    }

    return (
        <ConfigProvider locale={enUS}>
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                <div style={{
                    width: isAddingRow ? '70%' : '100%',
                    height: '100%',
                    padding: '20px',
                    transition: 'width 0.3s ease-in-out'
                }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Segmented<string>
                                    options={config.value.length > 0 ? config.value[0].dashBoardDataList.map(cat => ({
                                        label: renderSegmentOption(cat.category),
                                        value: cat.category
                                    })) : []}
                                    value={selectedSegment}
                                    style={{ backgroundColor: '#124561', color: 'white' }}
                                    onChange={(value) => {
                                        setSelectedSegment(value);
                                    }}
                                />
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={handleAddCategory}
                                    style={{ backgroundColor: '#cbcbcb' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <DynamicBrowse
                                    uiConfig={{
                                        sorting: false,
                                        multiSelect: false,
                                        tableTitle: 'Select Operation',
                                    }}
                                    initial=''
                                />
                                <Button
                                    onClick={() => handleVersionModalState('new', true)}
                                    style={{ backgroundColor: '#124561', color: 'white' }}
                                >
                                    Create Dashboard
                                </Button>
                                <Button
                                    onClick={() => handleVersionModalState('copy', true)}
                                    style={{ backgroundColor: '#124561', color: 'white' }}
                                >
                                    Copy Dashboard
                                </Button>
                            </div>
                        </div>
                        <ProTable<ChartData>
                            columns={columns}
                            dataSource={selectedCategoryData}
                            rowKey="key"
                            search={false}
                            pagination={false}
                            scroll={{ y: 'calc(100vh - 230px)' }}
                            dateFormatter="string"
                            options={{
                                setting: {
                                    draggable: true,
                                    checkable: true,
                                    checkedReset: true,
                                },
                                fullScreen: true,
                                reload: () => {
                                    setSearchText('');
                                },
                            }}
                            toolbar={{
                                search: {
                                    onSearch: setSearchText,
                                    placeholder: 'Search...',
                                },
                                actions: [
                                    <Button
                                        key="delete"
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                            const categoryData = config.value[0]?.dashBoardDataList.find(cat => cat.category === selectedSegment);
                                            if (categoryData) {
                                                handleDelete(categoryData);
                                            }
                                        }}
                                        danger
                                        size='small'
                                    >
                                        Delete
                                    </Button>,
                                    <Button
                                        key="add"
                                        icon={<PlusOutlined />}
                                        type="primary"
                                        size='small'
                                        style={{ backgroundColor: '#124561' }}
                                        onClick={() => {
                                            const categoryData = config.value[0]?.dashBoardDataList.find(cat => cat.category === selectedSegment);
                                            if (categoryData) {
                                                handleAddRow(categoryData);
                                            }
                                        }}
                                    >
                                        Add Row
                                    </Button>,
                                    <Button
                                        key="save"
                                        icon={<SaveOutlined />}
                                        type="primary"
                                        size='small'
                                        style={{ backgroundColor: '#124561' }}
                                        onClick={handleSaveChanges}
                                    >
                                        Save
                                    </Button>,
                                ],
                            }}
                        />
                    </Space>
                </div>
                {isAddingRow && (
                    <div style={{
                        width: '30%',
                        height: '100%',
                        padding: '20px',
                        borderLeftWidth: '1px',
                        borderLeftStyle: 'solid',
                        borderLeftColor: '#f0f0f0',
                        background: 'white',
                        transition: 'right 0.3s ease-in-out',
                        boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
                    }}>
                        <h3>Add New Row</h3>
                        <Space direction="vertical" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <Input
                                placeholder="Name"
                                value={newRowData.dataName}
                                onChange={e => setNewRowData(prev => ({ ...prev, dataName: e.target.value }))}
                            />
                            <Select
                                style={{ width: '100%' }}
                                value={newRowData.type}
                                onChange={value => setNewRowData(prev => ({ ...prev, type: value }))}
                                options={[
                                    { value: 'bar', label: 'Bar' },
                                    { value: 'line', label: 'Line' },
                                    { value: 'pie', label: 'Pie' },
                                    { value: 'stack', label: 'Stack' },
                                    { value: 'pareto', label: 'Pareto' },
                                    { value: 'gauge', label: 'Gauge' },
                                    { value: 'area', label: 'Area' },
                                    { value: 'heatmap', label: 'Heatmap' },
                                    { value: 'table', label: 'Table' },
                                    { value: 'tile', label: 'Tile' }
                                ]}
                            />
                            <Input
                                placeholder="Query"
                                value={newRowData.query}
                                onChange={e => setNewRowData(prev => ({ ...prev, query: e.target.value }))}
                            />
                            <Input
                                placeholder="Endpoint"
                                value={newRowData.endPoint}
                                onChange={e => setNewRowData(prev => ({ ...prev, endPoint: e.target.value }))}
                            />
                            <Input
                                placeholder="Seconds"
                                value={newRowData.seconds}
                                onChange={e => setNewRowData(prev => ({ ...prev, seconds: e.target.value }))}
                            />
                            <Select
                                style={{ width: '100%' }}
                                value={newRowData.column}
                                onChange={value => setNewRowData(prev => ({ ...prev, column: value }))}
                                options={[
                                    { label: '1', value: '24' },
                                    { label: '2', value: '12' },
                                    { label: '3', value: '8' },
                                    { label: '4', value: '6' },
                                ]}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Status</span>
                                <Switch
                                    checked={newRowData.enabled}
                                    size='small'
                                    style={{ backgroundColor: newRowData.enabled ? '#124561' : '#cbcbcb' }}
                                    onChange={checked => setNewRowData(prev => ({ ...prev, enabled: checked }))}
                                />
                            </div>
                            <Space>
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ backgroundColor: '#124561' }}
                                    onClick={() => {
                                        const categoryData = config.value[0]?.dashBoardDataList.find(cat => cat.category === selectedSegment);
                                        if (categoryData) {
                                            handleSaveNewRow(categoryData);
                                        }
                                    }}
                                >
                                    Add
                                </Button>
                                <Button size='small' onClick={() => setIsAddingRow(false)}>Cancel</Button>
                            </Space>
                        </Space>
                    </div>
                )}
                <Modal
                    title={`${versionModal.isNew ? 'Create' : 'Copy'} Dashboard`}
                    open={versionModal.isVisible}
                    onOk={handleVersionAction}
                    onCancel={() => handleVersionModalState(versionModal.isNew ? 'new' : 'copy', false)}
                    okButtonProps={{ style: { backgroundColor: '#49a6ff' } }}
                    afterOpenChange={(visible) => {
                        if (visible && inputRef.current) {
                            inputRef.current.focus();
                        }
                    }}
                >
                    <div style={{ padding: '20px 0' }}>
                        <Input
                            ref={inputRef}
                            placeholder="Enter dashboard name"
                            value={versionModal.name}
                            onChange={(e) => versionModal.setName(e.target.value)}
                            onPressEnter={handleVersionAction}
                            style={{ width: '100%' }}
                        />
                    </div>
                </Modal>
                <Modal
                    title={`Preview: ${previewModal.name}`}
                    open={previewModal.isVisible}
                    onCancel={() => previewModal.hide()}
                    footer={null}
                    width={800}
                >
                    <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                        {previewModal.data ? (
                            <JsonFormatter data={previewModal.data} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                Loading...
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default Settings;
