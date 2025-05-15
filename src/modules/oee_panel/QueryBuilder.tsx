import { Button, List, Splitter, Tabs, Modal, Form, Input, Select, message, Tree, AutoComplete, Checkbox, Badge, Tooltip, Switch, Empty } from 'antd'
import React, { useEffect, useState } from 'react'
import JsonFormatter from './components/JsonFormatter'
import { SaveOutlined, PlayCircleOutlined, DeleteOutlined, TableOutlined, KeyOutlined, FieldTimeOutlined, NumberOutlined, UserOutlined, SearchOutlined, ControlOutlined, PlusOutlined, DatabaseOutlined, LinkOutlined, DisconnectOutlined, EditOutlined } from '@ant-design/icons';
import TabPane from 'antd/es/tabs/TabPane';
import SqlEditor from './components/SqlEditor';
import { createDataSource, createQueryBuilder, dataSourceConnection, updateDataSourceConfig, deleteDataSourceConfig, deleteQueryBuilder, fetchAllQueryBuilder, fetchQueryBuilder, retrieveAllDataSource, retrieveAllTableAndColumn, updateQueryBuilder, } from '@services/queryBuilderService';
import { parseCookies } from 'nookies';
import { useConfigContext } from './hooks/configData';
import FilterTab from './components/FilterTab';
import { Editor } from '@monaco-editor/react';
import NewSqlEditor from './components/NewSqlEditor';

function QueryBuilder() {
    const [query, setQuery] = useState('');
    const [selectedQuery, setSelectedQuery] = useState<any>('');
    const [selectedQueryTitle, setSelectedQueryTitle] = useState<any>('');
    const [queryResult, setQueryResult] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [listData, setListData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [call, setCall] = useState(0);
    const [refresh, setRefresh] = useState(0);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAddDataSourceModalOpen, setIsAddDataSourceModalOpen] = useState(false);
    const [dataSourceForm] = Form.useForm();
    const [tableAndColumn, setTableAndColumn] = useState<any[]>([]);
    const [close, setClose] = useState(true);
    const [dataSources, setDataSources] = useState([]);
    const [filter, setFilter] = useState({});
    const [isUpdateDataSourceModalOpen, setIsUpdateDataSourceModalOpen] = useState(false);
    const [selectedDataSource, setSelectedDataSource] = useState(null);
    const [updateDataSourceForm] = Form.useForm();

    useEffect(() => {
        console.log(filter);
    }, [filter]);

    useEffect(() => {
        const fetchDataSources = async () => {
            const cookies = parseCookies();
            const site = cookies?.site;
            const response = await retrieveAllDataSource({ site: site });
            setDataSources(response);
        };
        fetchDataSources();
    }, [call]);

    useEffect(() => {
        const fetchTableAndColumn = async () => {
            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const response = await retrieveAllTableAndColumn({ site: site });
                setTableAndColumn(response || []);
            } catch (error) {
                console.error('Error fetching table and column:', error);
                setTableAndColumn([]);
            }
        };
        fetchTableAndColumn();
    }, [refresh]);

    // Function to infer column metadata
    const inferColumnMetadata = (tableName: string, columnName: string) => {
        // Infer primary key
        if (columnName === 'id') {
            return {
                name: columnName,
                type: 'INT',
                isPrimary: true,
                isNullable: false
            };
        }

        // Infer foreign keys
        if (columnName.endsWith('_id')) {
            const refTable = columnName.replace('_id', '');
            return {
                name: columnName,
                type: 'INT',
                isForeignKey: true,
                isNullable: false,
            };
        }

        // Infer date fields
        if (columnName.includes('date')) {
            return {
                name: columnName,
                type: 'DATETIME',
                isNullable: false,
            };
        }

        // Default string fields
        return {
            name: columnName,
            type: columnName === 'name' ? 'VARCHAR(100)' : 'VARCHAR(50)',
            isNullable: true,
        };
    };

    // Transform simple structure to enhanced structure
    const tableStructure = Array.isArray(tableAndColumn) ? tableAndColumn.map(table => ({
        table: table.table,
        columns: Array.isArray(table.columns) ? table.columns.map(col => inferColumnMetadata(table.table, col)) : []
    })) : [];

    // Enhanced function to transform data for Tree component
    const getTreeData = () => {
        if (!Array.isArray(tableStructure) || tableStructure.length === 0) return [];

        return tableStructure.map((item, index) => ({
            key: `table-${index}`,
            title: (
                <div style={{
                    padding: '8px 0',
                    borderBottom: index !== tableStructure.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                    <div style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <TableOutlined style={{
                            marginRight: 8,
                            color: '#1890ff',
                            fontSize: '16px'
                        }} />
                        {item.table}
                    </div>
                </div>
            ),
            children: Array.isArray(item.columns) ? item.columns.map((column, colIndex) => ({
                key: `${item.table}-col-${colIndex}`,
                title: (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 0',
                        borderBottom: colIndex !== item.columns.length - 1 ? '1px solid #f5f5f5' : 'none',
                        marginLeft: '24px'
                    }}>
                        <div style={{
                            width: '24px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {column.isPrimary && <KeyOutlined style={{ color: '#faad14' }} />}
                            {column.isForeignKey && <KeyOutlined style={{ color: '#52c41a' }} />}
                            {column.type.includes('TIME') && <FieldTimeOutlined style={{ color: '#722ed1' }} />}
                            {column.type.includes('INT') && !column.isPrimary && !column.isForeignKey &&
                                <NumberOutlined style={{ color: '#eb2f96' }} />}
                            {column.type.includes('VARCHAR') && <NumberOutlined style={{ color: '#13c2c2' }} />}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                fontWeight: 500,
                                minWidth: '120px'
                            }}>
                                {column.name}
                            </span>
                        </div>
                    </div>
                ),
                isLeaf: true
            })) : []
        }));
    };

    // Get table options for search
    const getTableOptions = () => {
        if (!Array.isArray(tableStructure)) return [];

        return tableStructure
            .filter(table =>
                table.table.toLowerCase().includes(searchText.toLowerCase())
            )
            .map(table => ({
                value: table.table,
                label: (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 4px'
                    }}>
                        {table.table}
                    </div>
                )
            }));
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleSelect = (value: string) => {
        setSearchText(value);
    };

    useEffect(() => {
        const fetchQueryBuilder = async () => {
            const cookies = parseCookies();
            const site = cookies?.site;
            try {
                const response = await fetchAllQueryBuilder(site);
                setListData(response);
                setCall(0);
            } catch (error) {
                console.log(error);
                message.error(error.message);
            }
        }
        fetchQueryBuilder();
    }, [call]);

    const pageSize = 7;


    const handleQueryClick = (item: any) => {
        setClose(false);
        setQuery(item?.value);
        setSelectedQuery(item);
        setSelectedQueryTitle(item?.templateName);
    };

    const handleRunQuery = async () => {
        message.destroy();
        const cookies = parseCookies();
        const site = cookies?.site;
        const { createdDatetime, id, ...queryData } = selectedQuery;
        try {
            const runQueryData = {
                templateName: queryData.templateName,
                value: query,
                site: site,
                filters: Object.keys(filter).reduce((acc, key) => {
                    if (filter[key] !== null && filter[key].length > 0) {
                        acc[key] = filter[key];
                    }
                    return acc;
                }, {site: site})
            }
            const response = await fetchQueryBuilder(runQueryData);
            if (response) {
                setQueryResult(response);
            }
        } catch (error) {
            message.error("Failed to fetch query data, check the table");
        }
    };

    const showModal = (isUpdate = false) => {
        console.log('Showing modal');
        setIsUpdateMode(isUpdate);
        form.setFieldsValue({
            templateName: isUpdate ? selectedQuery.templateName : '',
            templateType: isUpdate ? selectedQuery.templateType : '',
            status: isUpdate ? selectedQuery.status : '',
            value: query
        });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const handleModalSubmit = async () => {
        message.destroy();
        try {
            const cookies = parseCookies();
            const site = cookies?.site;
            const values = await form.validateFields();
            const queryData = {
                ...values,
                value: query,
                site: site
            };

            let response;
            if (isUpdateMode) {
                response = await updateQueryBuilder(queryData);
            } else {
                response = await createQueryBuilder(queryData);
            }

            if (response.message_details.msg_type === 'E') {
                message.error(response.message_details.msg);
            }
            else {
                message.success(response.message_details.msg);
                setIsModalOpen(false);
                form.resetFields();
                setCall(call + 1);

                // Automatically select the newly created query
                if (!isUpdateMode) {
                    const newQuery = {
                        templateName: values.templateName,
                        templateType: values.templateType,
                        status: values.status,
                        value: query
                    };
                    setSelectedQuery(newQuery);
                    setClose(false);
                }
            }
        } catch (error) {
            message.error(isUpdateMode ? "Error updating query" : "Error creating query");
        }
    };

    const handleSaveQuery = () => {
        setSelectedQuery(null); // Reset selected query when creating new
        setQuery('');
        showModal(false);
        form.setFieldValue('value', '');
    };

    const handleUpdateQuery = async () => {
        if (!selectedQuery) {
            message.warning('Please select a query to update');
            return;
        }

        try {
            const cookies = parseCookies();
            const site = cookies?.site;
            const queryData = {
                templateName: selectedQuery.templateName,
                templateType: selectedQuery.templateType,
                status: selectedQuery.status,
                value: query,
                site: site
            };

            const response = await updateQueryBuilder(queryData);

            if (response.message_details.msg_type === 'E') {
                message.error(response.message_details.msg);
            } else {
                message.success(response.message_details.msg);
                setCall(call + 1);
            }
        } catch (error) {
            message.error("Error updating query");
        }
    };

    const handleDeleteQuery = async (item: any) => {
        message.destroy();
        try {
            const cookies = parseCookies();
            const site = cookies?.site;
            const queryData = {
                site: site,
                templateName: item
            };
            const response = await deleteQueryBuilder(queryData);
            if (response.message_details.msg_type === 'E') {
                message.error(response.message_details.msg);
            }
            else {
                message.success(response.message_details.msg);
                setCall(call + 1);
            }
        } catch (error) {
            message.error("Error deleting query");
        }
    };

    const handleFilterModalOpen = () => {
        setIsFilterModalOpen(true);
    };

    const handleFilterModalClose = () => {
        setIsFilterModalOpen(false);
    };

    const handleAddDataSource = () => {
        setIsAddDataSourceModalOpen(true);
    };

    const handleDataSourceSubmit = async () => {
        try {
            const values = await dataSourceForm.validateFields();
            const cookies = parseCookies();
            const site = cookies?.site;
            const user = cookies?.rl_user_id;
            const response = await createDataSource({ ...values, site: site, user: user });
            if (response.message_details.msg_type === 'E') {
                message.error(response.message_details.msg);
            }
            else {
                message.success(response.message_details.msg);
                setIsAddDataSourceModalOpen(false);
                dataSourceForm.resetFields();
                setCall(call + 1);
            }
        } catch (error) {
            message.error('Please fill all required fields');
        }
    };

    const toggleConnection = async (item: any) => {
        const cookies = parseCookies();
        const site = cookies?.site;
        if (item.status) {
            item.status = false;
        }
        else {
            item.status = true;
        }
        const data = {
            dataSourceId: item.dataSourceId,
            dataSourceName: item.dataSourceName,
            site: site,
            status: item.status,
            host: item.host,
            port: item.port,
            user: item.user,
            username: item.username,
            password: item.password,
            dataBase: item.dataBase
        }
        const response = await dataSourceConnection(data);
        if (response.message_details.msg_type === 'E') {
            message.error(response.message_details.msg);

        }
        else {
            message.success(response.message_details.msg);
            setCall(call + 1);
            setRefresh(refresh + 1);
        }
    };

    const deleteDataSource = async (item: any) => {
        const cookies = parseCookies();
        const site = cookies?.site;
        const data = {
            dataSourceId: item.dataSourceId,
            site: site,
            user: cookies?.rl_user_id
        }
        const response = await deleteDataSourceConfig(data);
        if (response.message_details.msg_type === 'E') {
            message.error(response.message_details.msg);
        }
        else {
            message.success(response.message_details.msg);
            setCall(call + 1);
            setRefresh(refresh + 1);
        }
    };

    const handleUpdateDataSource = (item) => {
        setSelectedDataSource(item);
        updateDataSourceForm.setFieldsValue({
            dataSourceName: item.dataSourceName,
            host: item.host,
            port: item.port,
            username: item.username,
            password: item.password,
            dataBase: item.dataBase
        });
        setIsUpdateDataSourceModalOpen(true);
    };

    const handleUpdateDataSourceSubmit = async () => {
        try {
            const values = await updateDataSourceForm.validateFields();
            const cookies = parseCookies();
            const site = cookies?.site;
            const user = cookies?.rl_user_id;
            const data = {
                ...values,
                dataSourceId: selectedDataSource.dataSourceId,
                site: site,
                user: user,
                status: selectedDataSource.status
            };
            const response = await updateDataSourceConfig(data);
            if (response.message_details.msg_type === 'E') {
                message.error(response.message_details.msg);
            } else {
                message.success(response.message_details.msg);
                setIsUpdateDataSourceModalOpen(false);
                updateDataSourceForm.resetFields();
                setCall(call + 1);
            }
        } catch (error) {
            message.error('Please fill all required fields');
        }
    };

    return (
        <div style={{ padding: '20px', paddingBottom: 0, width: '100%', height: '100%' }}>
            <Splitter style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
                <Splitter.Panel defaultSize="40%" min="30%" max="100%" style={{ padding: 10 }}>
                    <Tabs style={{ flex: 1 }}>
                    <TabPane tab="Table List" key="1">
                            <div
                                style={{
                                    height: 'calc(100vh - 200px)',
                                    overflow: 'auto',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                                }}
                            >
                                <div style={{
                                    marginBottom: '16px',
                                    borderBottom: '1px solid #f0f0f0',
                                    paddingBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#262626'
                                        }}>
                                            Database Schema
                                        </span>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#8c8c8c',
                                            marginLeft: '8px'
                                        }}>
                                            ({tableStructure.length} tables)
                                        </span>
                                    </div>
                                    <AutoComplete
                                        value={searchText}
                                        options={getTableOptions()}
                                        onSelect={handleSelect}
                                        onSearch={handleSearch}
                                        placeholder="Search tables..."
                                        style={{
                                            width: '30%'
                                        }}
                                        dropdownStyle={{
                                            maxHeight: '300px',
                                            overflow: 'auto'
                                        }}
                                    >
                                        <Input
                                            suffix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                                            style={{ borderRadius: '6px' }}
                                            allowClear
                                        />
                                    </AutoComplete>
                                    <ControlOutlined
                                        style={{
                                            color: '#1890ff',
                                            fontSize: 20,
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleFilterModalOpen}
                                    />
                                </div>
                                {tableAndColumn.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '40px 0'
                                    }}>
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description={
                                                <div style={{ textAlign: 'center' }}>
                                                    <p style={{
                                                        fontSize: '16px',
                                                        color: '#262626',
                                                        margin: '8px 0'
                                                    }}>
                                                        No Tables Available
                                                    </p>
                                                    <p style={{
                                                        fontSize: '14px',
                                                        color: '#8c8c8c'
                                                    }}>
                                                        Please connect to a database to view tables and columns
                                                    </p>
                                                </div>
                                            }
                                        >
                                            <Button
                                                type="primary"
                                                icon={<DatabaseOutlined />}
                                                onClick={handleFilterModalOpen}
                                                style={{ marginTop: '16px' }}
                                            >
                                                Connect Database
                                            </Button>
                                        </Empty>
                                    </div>
                                ) : (
                                    <Tree
                                        showIcon={false}
                                        defaultExpandAll
                                        treeData={searchText ?
                                            getTreeData().filter(node => node.title.props.children.props.children[1] === searchText)
                                            : getTreeData()
                                        }
                                        style={{
                                            backgroundColor: '#fff',
                                        }}
                                        className="database-schema-tree"
                                        selectable={false}
                                    />
                                )}
                            </div>
                        </TabPane>
                        <TabPane tab="Query List" key="2" style={{ height: '100%'}}>
                            <List
                                style={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}
                                bordered
                                header={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>Query List ({listData.length}) </div>
                                    <AutoComplete
                                        style={{ width: '50%' }}
                                        placeholder="Search queries..."
                                        options={listData.map(item => ({
                                            value: item.templateName,
                                            label: (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span>{item.templateName}</span>
                                                    <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                                        ({item.templateType})
                                                    </span>
                                                </div>
                                            )
                                        }))}
                                        filterOption={(inputValue, option) =>
                                            option?.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                                        }
                                        onSelect={(value) => {
                                            const selectedItem = listData.find(item => item.templateName === value);
                                            if (selectedItem) {
                                                handleQueryClick(selectedItem);
                                            }
                                        }}
                                    >
                                        <Input 
                                            suffix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                                            style={{ borderRadius: '6px' }}
                                            allowClear
                                        />
                                    </AutoComplete>
                                    <Button onClick={handleSaveQuery} icon={<PlusOutlined />}>Create</Button>
                                </div>}
                                dataSource={listData}
                                renderItem={(item) => (
                                    <List.Item
                                        key={item.templateName}
                                        onClick={() => handleQueryClick(item)}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: selectedQuery?.templateName === item.templateName ? '#e6f4ff' : 'transparent',
                                            borderLeft: selectedQuery?.templateName === item.templateName ? '3px solid #1890ff' : '3px solid transparent',
                                            transition: 'all 0.3s ease',
                                            marginBottom: '4px',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div style={{
                                                    fontWeight: selectedQuery?.templateName === item.templateName ? 700 : 600,
                                                    fontSize: 13,
                                                    color: selectedQuery?.templateName === item.templateName ? '#1890ff' : 'inherit',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>

                                                    # {item.templateName}
                                                </div>
                                            }
                                            description={
                                                <span style={{
                                                    color: selectedQuery?.templateName === item.templateName ? '#1890ff' : '#8c8c8c'
                                                }}>
                                                    {item.templateType}
                                                </span>
                                            }
                                        />
                                        <Button
                                            size='small'
                                            type="dashed"
                                            danger
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteQuery(item.templateName);
                                            }}
                                        >
                                            <DeleteOutlined />
                                        </Button>
                                    </List.Item>
                                )}
                            />
                        </TabPane>
                        <TabPane tab="Filter" key="3" style={{padding: 10}}>
                            <FilterTab setFilter={setFilter} filter={filter}/>
                        </TabPane>
                    </Tabs>
                </Splitter.Panel>
                <Splitter.Panel style={{
                    transition: 'transform 0.3s ease-in-out',
                    position: 'relative',
                    width: close ? '0%' : '60%'
                }}>
                    {close ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            flexDirection: 'column',
                            color: '#8c8c8c',
                            backgroundColor: '#fafafa',
                            border: '1px dashed #d9d9d9',
                            borderRadius: '8px',
                            margin: '10px'
                        }}>
                            <DatabaseOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#1890ff' }} />
                            <span style={{ fontSize: '16px', fontWeight: 500 }}>Please select the Template</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 10, overflow: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600,marginBottom: 10 }}>{selectedQueryTitle.toUpperCase()}</span>
                            </div>
                            <NewSqlEditor query={query} setQuery={setQuery} tableAndColumn={tableAndColumn}/>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: 5, marginTop: 10 }}>
                                <Button onClick={handleUpdateQuery} icon={<SaveOutlined />}>Save</Button>
                                <Button type="primary" style={{ backgroundColor: '#12B76A' }} onClick={handleRunQuery} icon={<PlayCircleOutlined />}>Run</Button>
                            </div>
                            <Tabs style={{ flex: 1 }}>
                                <TabPane tab="Result" key="1" style={{ height: '300px', overflow: 'auto' }}>
                                    <JsonFormatter data={queryResult} />
                                </TabPane>
                                <TabPane tab="Error" key="2">
                                </TabPane>
                            </Tabs>
                        </div>
                    )}
                </Splitter.Panel>
            </Splitter>
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DatabaseOutlined style={{ color: '#1890ff' }} />
                        <span>Data Sources</span>
                    </div>
                }
                open={isFilterModalOpen}
                onCancel={handleFilterModalClose}
                footer={null}
                width={800}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100vh - 300px)',
                    maxHeight: '600px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '20px 0',
                        marginBottom: '16px',
                        borderBottom: '1px solid #f0f0f0',
                    }}>
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>Available Data Sources</span>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddDataSource}
                        >
                            Add Data Source
                        </Button>
                    </div>
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        paddingRight: '4px'
                    }}>
                        <List
                            dataSource={dataSources}
                            renderItem={item => (
                                <List.Item
                                    key={item.id}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: '#fafafa',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleUpdateDataSource(item)}
                                    actions={[
                                        <Tooltip title={item.status ? 'Disconnect' : 'Connect'}>
                                            <Button
                                                type={item.status ? 'primary' : 'default'}
                                                icon={item.status ? <DisconnectOutlined /> : <LinkOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleConnection(item);
                                                }}
                                                style={{
                                                    backgroundColor: item.status ? '#52c41a' : undefined,
                                                    borderColor: item.status ? '#52c41a' : undefined
                                                }}
                                            />
                                        </Tooltip>,
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteDataSource(item);
                                            }}
                                        />
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Badge
                                                status={item.status ? 'success' : 'default'}
                                                offset={[0, 28]}
                                            >
                                                <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                            </Badge>
                                        }
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 600 }}>{item.dataSourceName}</span>
                                                <Badge
                                                    status={item.status ? 'success' : 'error'}
                                                    text={item.status ? 'Connected' : 'Disconnected'}
                                                />
                                            </div>
                                        }
                                        description={
                                            <div style={{ color: '#8c8c8c' }}>
                                                {`${item.host}:${item.port} (${item.dataBase})`}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                            style={{
                                minHeight: '100%'
                            }}
                        />
                    </div>
                </div>
            </Modal>
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusOutlined style={{ color: '#1890ff' }} />
                        <span>Add New Data Source</span>
                    </div>
                }
                open={isAddDataSourceModalOpen}
                onCancel={() => {
                    setIsAddDataSourceModalOpen(false);
                    dataSourceForm.resetFields();
                }}
                onOk={handleDataSourceSubmit}
                width={600}
            >
                <Form
                    form={dataSourceForm}
                    layout="vertical"
                    style={{ padding: '20px 0' }}
                >
                    <Form.Item
                        name="dataSourceName"
                        label="Data Source Name"
                        rules={[{ required: true, message: 'Please enter data source name' }]}
                    >
                        <Input
                            prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Enter a name for this connection"
                        />
                    </Form.Item>
                    <Form.Item
                        name="host"
                        label="Host"
                        rules={[{ required: true, message: 'Please enter host' }]}
                    >
                        <Input
                            prefix={<LinkOutlined style={{ color: '#1890ff' }} />}
                            placeholder="e.g., localhost or db.example.com"
                        />
                    </Form.Item>
                    <Form.Item
                        name="port"
                        label="Port"
                        rules={[{ required: true, message: 'Please enter port' }]}
                    >
                        <Input
                            prefix={<NumberOutlined style={{ color: '#1890ff' }} />}
                            placeholder="e.g., 5432"
                        />
                    </Form.Item>
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: 'Please enter username' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Enter database username"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please enter password' }]}
                    >
                        <Input.Password
                            prefix={<KeyOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Enter database password"
                        />
                    </Form.Item>
                    <Form.Item
                        name="dataBase"
                        label="Database Name"
                        rules={[{ required: true, message: 'Please enter database name' }]}
                    >
                        <Input
                            prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Enter database name"
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={isUpdateMode ? "Update Query" : "Create New Query"}
                open={isModalOpen}
                onOk={handleModalSubmit}
                onCancel={handleModalCancel}
                okText={isUpdateMode ? "Update" : "Create"}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="templateName"
                        label="Template Name"
                        rules={[{ required: true, message: 'Please enter template name' }]}
                    >
                        <Input disabled={isUpdateMode} />
                    </Form.Item>
                    <Form.Item
                        name="templateType"
                        label="Template Type"
                        rules={[{ required: true, message: 'Please select template type' }]}
                    >
                        <Select>
                            <Select.Option value="SQL">SQL</Select.Option>
                            <Select.Option value="NoSQL">NoSQL</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select>
                            <Select.Option value="Active">Active</Select.Option>
                            <Select.Option value="Inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <EditOutlined style={{ color: '#1890ff' }} />
                        <span>Update Data Source</span>
                    </div>
                }
                open={isUpdateDataSourceModalOpen}
                onCancel={() => {
                    setIsUpdateDataSourceModalOpen(false);
                    updateDataSourceForm.resetFields();
                }}
                onOk={handleUpdateDataSourceSubmit}
                width={600}
            >
                <Form
                    form={updateDataSourceForm}
                    layout="vertical"
                    style={{ padding: '20px 0' }}
                >
                    <Form.Item
                        name="dataSourceName"
                        label="Data Source Name"
                        rules={[{ required: true, message: 'Please enter data source name' }]}
                    >
                        <Input
                            prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Enter a name for this connection"
                        />
                    </Form.Item>
                    <Form.Item
                        name="host"
                        label="Host"
                        rules={[{ required: true, message: 'Please enter host' }]}
                    >
                        <Input
                            prefix={<LinkOutlined style={{ color: '#1890ff' }} />}
                            placeholder="e.g., localhost or db.example.com"
                        />
                    </Form.Item>
                    <Form.Item
                        name="port"
                        label="Port"
                        rules={[{ required: true, message: 'Please enter port' }]}
                    >
                        <Input
                            prefix={<NumberOutlined style={{ color: '#1890ff' }} />}
                            placeholder="e.g., 5432"
                        />
                    </Form.Item>
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: 'Please enter username' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Enter database username"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please enter password' }]}
                    >
                        <Input.Password
                            prefix={<KeyOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Enter database password"
                        />
                    </Form.Item>
                    <Form.Item
                        name="dataBase"
                        label="Database Name"
                        rules={[{ required: true, message: 'Please enter database name' }]}
                    >
                        <Input
                            prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                            placeholder="Enter database name"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default QueryBuilder;