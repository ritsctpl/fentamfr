import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Button, Table, Modal, message } from 'antd';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { UomContext } from '../hooks/UomContext';
import { SearchOutlined } from '@ant-design/icons';
import {
  createCycleTime,
  deleteCycleTime,
  fetchAllCycleTime,
  fetchAllWorkCenter, fetchTop50WorkCenter, retrieveAllItem, retrieveAllOperation, retrieveAllResource,
  retrieveTop50Item, retrieveTop50Operation,
  retrieveTop50Resource
} from '@services/uomService';

const CycleTimeForm: React.FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { payloadData, setPayloadData, username } = useContext<any>(UomContext);
  const [modalTableData, setModalTableData] = useState<any>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [formValue, setFormValues] = useState<any>();
  const [modalColumns, setModalColumns] = useState<any>();
  const [selectedField, setSelectedField] = useState<string>();

  const [material, setMaterial] = useState<string>('');
  const [materialVersion, setMaterialVersion] = useState<string>('');
  const [cycleTime, setCycleTime] = useState<string>('');
  const [manufacturedTime, setManufacturedTime] = useState<string>('');
  const [isCycleTimeDisabled, setIsCycleTimeDisabled] = useState<boolean>(true);
  const [isManufacturedTimeDisabled, setIsManufacturedTimeDisabled] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<any>();
  const [flag, setFlag] = useState<number>(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [pendingRowSelection, setPendingRowSelection] = useState<any>(null);

  interface RowData {
    resource: string;
    workCenter: string;
    operation: string;
    operationVersion: string;
    material: string;
    materialVersion: string;
    cycleTime: string;
    manufacturedTime: string;
    key: any;
  }
  // Effect to toggle field availability
  useEffect(() => {
    if (material && materialVersion) {
      setIsCycleTimeDisabled(true);
      setIsManufacturedTimeDisabled(false);
      // form.setFieldsValue({cycleTime: ""});
    } else {
      setIsCycleTimeDisabled(false);
      setIsManufacturedTimeDisabled(true);
      // form.setFieldsValue({manufacturedTime: ""});

    }
  }, [material, materialVersion]);

  useEffect(() => {
    const fetchAllCycleTimeData = async () => {
      try {
        const cookies = parseCookies();
        const site = cookies.site;
        const response = await fetchAllCycleTime(site);
        console.log("All cycle time: ", response);
        if (response) {
          if (!response.errorCode) {
            if (response.length > 0) {
              const formattedResponse = response.map((item, index) => ({
                ...item,
                id: index,
                key: index
              }))
              setDataSource(formattedResponse);
              setFlag(flag + 1);
            }
          }
        }
      }
      catch (error) {
        console.error("Error decoding token:", error);
        setFlag(flag + 1);
      }
    }
    debugger
    
      fetchAllCycleTimeData();
  }, [flag]);



  const handleSubmit = (values: any) => {
    // console.log('Form Data Submitted:', values);
    // Add your form submission logic here (e.g., API call)
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleFilterChange = (
    value: string,
    key: string,
    column: any
  ) => {
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        return { ...item, [column]: value };
      }
      return item;
    });
    setDataSource(newData);
  };


  // Table columns definition
  const columns: any = [
    {
      title: t('resource'),
      dataIndex: 'resource',
      key: 'resource',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: {
        setSelectedKeys: (keys: string[]) => void;
        selectedKeys: string[];
        confirm: () => void;
        clearFilters: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: string, record: { resource?: string | null }) =>
        (record.resource?.toString().toLowerCase() || '').includes(value.toLowerCase()),
    },
    {
      title: t('workCenter'),
      dataIndex: 'workCenter',
      key: 'workCenter',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: {
        setSelectedKeys: (keys: string[]) => void;
        selectedKeys: string[];
        confirm: () => void;
        clearFilters: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: string, record: { workCenter?: string | null }) =>
        (record.workCenter?.toString().toLowerCase() || '').includes(value.toLowerCase()),
    },
    {
      title: t('operation'),
      dataIndex: 'operation',
      key: 'operation',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: {
        setSelectedKeys: (keys: string[]) => void;
        selectedKeys: string[];
        confirm: () => void;
        clearFilters: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: string, record: { operation?: string | null }) =>
        (record.operation?.toString().toLowerCase() || '').includes(value.toLowerCase()),
    },
    {
      title: t('operationVersion'),
      dataIndex: 'operationVersion',
      key: 'operationVersion',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: {
        setSelectedKeys: (keys: string[]) => void;
        selectedKeys: string[];
        confirm: () => void;
        clearFilters: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: string, record: { operationVersion?: string | null }) =>
        (record.operationVersion?.toString().toLowerCase() || '').includes(value.toLowerCase()),
    },
    {
      title: t('material'),
      dataIndex: 'material',
      key: 'material',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: {
        setSelectedKeys: (keys: string[]) => void;
        selectedKeys: string[];
        confirm: () => void;
        clearFilters: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: string, record: { material?: string | null }) =>
        (record.material?.toString().toLowerCase() || '').includes(value.toLowerCase()),
    },
    {
      title: t('materialVersion'),
      dataIndex: 'materialVersion',
      key: 'materialVersion',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: {
        setSelectedKeys: (keys: string[]) => void;
        selectedKeys: string[];
        confirm: () => void;
        clearFilters: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: string, record: { materialVersion?: string | null }) =>
        (record.materialVersion?.toString().toLowerCase() || '').includes(value.toLowerCase()),
    },
    {
      title: t('cycleTime'),
      dataIndex: 'cycleTime',
      key: 'cycleTime',
    },
    {
      title: t('manufacturedTime'),
      dataIndex: 'manufacturedTime',
      key: 'manufacturedTime',
    },
  ];


  const handleBrowseClick = async (field) => {
    setSelectedField(field);
    if (field == "resource") {
      const oColumns = [
        {
          title: t('resource'),
          dataIndex: 'resource',
          key: 'resource',
        },
        {
          title: t('description'),
          dataIndex: 'description',
          key: 'description',
        }, {
          title: t('status'),
          dataIndex: 'status',
          key: 'status',
        },

      ];
      setModalColumns(oColumns);

      let response;
      const cookies = parseCookies();
      const site = cookies.site;
      const typedValue = form.getFieldsValue().resource;
      try {
        if (typedValue)
          response = await retrieveAllResource(site, typedValue);
        else
          response = await retrieveTop50Resource(site);
        if (response) {
          if (!response.errorCode) {
            const formattedData = response.map((item: any, index: number) => ({
              ...item,
              id: index, // Use index as ID
              key: index
            }));
            setModalTableData(formattedData);
          }
        }
        else {
          setModalTableData([]);
        }

      } catch (error) {
        console.error("Error fetching resource data:", error);
      }
      setModalVisible(true);
    }

    else if (field == "workCenter") {
      const oColumns = [
        {
          title: t('workCenter'),
          dataIndex: 'workCenter',
          key: 'workCenter',
        },
        {
          title: t('description'),
          dataIndex: 'description',
          key: 'description',
        },
        //  {
        //   title: t('status'), 
        //   dataIndex: 'status',
        //   key: 'status',
        // },

      ];
      setModalColumns(oColumns);
      let response;
      const cookies = parseCookies();
      const site = cookies.site;
      const typedValue = form.getFieldsValue().workCenter;
      try {
        if (typedValue)
          response = await fetchAllWorkCenter(site, typedValue);
        else
          response = await fetchTop50WorkCenter(site);
        if (response) {
          if (!response.errorCode) {
            const formattedData = response.map((item: any, index: number) => ({
              ...item,
              id: index, // Use index as ID
              key: index
            }));
            setModalTableData(formattedData);
          }
        }
        else {
          setModalTableData([]);
        }
      } catch (error) {
        console.error("Error fetching work center data:", error);
      }
      setModalVisible(true);
    }

    else if (field == "operation") {
      const oColumns = [
        {
          title: t('operation'),
          dataIndex: 'operation',
          key: 'operation',
        },
        {
          title: t('version'),
          dataIndex: 'operationVersion',
          key: 'operationVersion',
        }, {
          title: t('description'),
          dataIndex: 'description',
          key: 'description',
        },
        {
          title: t('status'),
          dataIndex: 'status',
          key: 'status',
        },

      ];
      setModalColumns(oColumns);
      let response;
      const cookies = parseCookies();
      const site = cookies.site;
      const typedValue = form.getFieldsValue().operation;
      try {
        if (typedValue)
          response = await retrieveAllOperation(site, typedValue);
        else
          response = await retrieveTop50Operation(site);
        if (response) {
          if (!response.errorCode) {
            const formattedData = response.map((item: any, index: number) => ({
              ...item,
              id: index, // Use index as ID
              key: index,
              operationVersion: item.revision,
            }));
            setModalTableData(formattedData);
          }
        }
        else {
          setModalTableData([]);
        }
      } catch (error) {
        console.error("Error fetching opreation data:", error);
      }
      setModalVisible(true);
    }

    else if (field == "material") {
      const oColumns = [
        {
          title: t('material'),
          dataIndex: 'material',
          key: 'material',
        },
        {
          title: t('version'),
          dataIndex: 'materialVersion',
          key: 'materialVersion',
        }, {
          title: t('description'),
          dataIndex: 'description',
          key: 'description',
        },
        {
          title: t('status'),
          dataIndex: 'status',
          key: 'status',
        },

      ];
      setModalColumns(oColumns);
      let response;
      const cookies = parseCookies();
      const site = cookies.site;
      const typedValue = form.getFieldsValue().material;
      try {
        if (typedValue)
          response = await retrieveAllItem(site, typedValue);
        else
          response = await retrieveTop50Item(site);
        if (response) {
          if (!response.errorCode) {
            const formattedData = response.map((item: any, index: number) => ({
              ...item,
              id: index, // Use index as ID
              key: index,
              material: item.item,
              materialVersion: item.revision,
            }));
            setModalTableData(formattedData);
          }
        }
        else {
          setModalTableData([]);
        }
      } catch (error) {
        console.error("Error fetching item data:", error);
      }
      setModalVisible(true);
    }

  };

  const handleInputChange = (fieldName: string, value: string) => {
    if (fieldName != "cycleTime" && fieldName != "manufacturedTime")
      form.setFieldsValue({ [fieldName]: value.toUpperCase() });
    else
      form.setFieldsValue({ [fieldName]: value.toUpperCase() });
    const record: any = form.getFieldsValue();
    if (record.resource || record.workCenter || record.operation || record.operationVersion) {
      setIsManufacturedTimeDisabled(true);
      setIsCycleTimeDisabled(false);
      form.setFieldsValue({ manufacturedTime: "" });
    }
    else {
      setIsManufacturedTimeDisabled(false);
      setIsCycleTimeDisabled(true);
      form.setFieldsValue({ cycleTime: "" });
    }

    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue()
    }));
    setIsModified(true);
  };

  const handleModalOk = (record) => {
    const typedValue = record[selectedField];
    if (typedValue) {
      form.setFieldsValue({
        [selectedField]: typedValue,
      });

      // Check if the selected field is 'operation'
      if (selectedField == 'operation') {
        // Set the operationVersion field in the form based on the current operation value
        const operationVersionValue = record.operationVersion; // or any logic to derive the version
        form.setFieldsValue({
          operationVersion: operationVersionValue, // Update the operationVersion in the form
        });
      }
      if (selectedField == 'material') {
        // Set the operationVersion field in the form based on the current operation value
        const materialVersionValue = record.materialVersion; // or any logic to derive the version
        form.setFieldsValue({
          materialVersion: materialVersionValue, // Update the operationVersion in the form
        });
        setMaterial(record.material);
        setMaterialVersion(record.materialVersion);
      }
      setIsModified(true);
    }

    setFormValues(form.getFieldsValue());
    setModalVisible(false);
    if (record.resource || record.workCenter || record.operation || record.operationVersion) {
      setIsManufacturedTimeDisabled(true);
      setIsCycleTimeDisabled(false);
      form.setFieldsValue({ manufacturedTime: "" });
    }
    else {
      setIsManufacturedTimeDisabled(false);
      setIsCycleTimeDisabled(true);
      form.setFieldsValue({ cycleTime: "" });
    }

    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue(),
    }));
  };

  const handleSave = async () => {
    console.log("Request: ", payloadData);

    if (isCycleTimeDisabled == false) {
      if (!payloadData.cycleTime) {
        message.error("Cycle time cannot be empty");
        return;
      }
    }
    if (isManufacturedTimeDisabled == false) {
      if (!payloadData.manufacturedTime) {
        message.error("Manufactured Time cannot be empty");
        return;
      }
    }

    try {
      const cookies = parseCookies();
      const site = cookies.site;
      payloadData.site = site;
      payloadData.userId = username;
      const response = await createCycleTime(payloadData);
      console.log("Create response: ", response);
      if (response) {
        if (!response.errorCode) {
          message.success(response.message_details.msg);
          setFlag(flag + 1);
        }
        else {
          message.error(response.message);
        }
      }
    }
    catch (error) {
      console.error("Error creating cycle time:", error);
    }
    setIsModified(false);
  };

  const handleDelete = async () => {
    console.log("Delete Request: ", payloadData);
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      payloadData.site = site;
      payloadData.userId = username;
      delete payloadData.id;
      delete payloadData.key;
      const response = await deleteCycleTime(payloadData);
      console.log("Delete response: ", response);
      if (response) {
        if (!response.errorCode) {
          message.success(response.message_details.msg);
          setFlag(flag + 1);
        }
        else {
          message.error(response.message);
        }
      }
    }
    catch (error) {
      console.error("Error deleting cycle time:", error);
    }
    setIsModified(false);
  };

  const handleClear = () => {
    form.resetFields();
    setIsCycleTimeDisabled(false);
    setIsManufacturedTimeDisabled(true);
  }

  useEffect(() => {
    if (!isModified && pendingRowSelection) {
      const { newSelectedRowKeys, selectedRows } = pendingRowSelection;
      setSelectedRowKeys(newSelectedRowKeys);
      if (selectedRows.length > 0) {
        const rowData = selectedRows[0];
        form.setFieldsValue({
          resource: rowData.resource,
          workCenter: rowData.workCenter,
          operation: rowData.operation,
          operationVersion: rowData.operationVersion,
          material: rowData.material,
          materialVersion: rowData.materialVersion,
          cycleTime: rowData.cycleTime,
          manufacturedTime: rowData.manufacturedTime,
        });
      }
      setPendingRowSelection(null);
    }
  }, [isModified, pendingRowSelection]);

  return (
    <div style={{ height: 'auto', overflowY: 'auto', position: "sticky" }}>
      <Row justify="center" align="middle">
        <Col span={12}>
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            // initialValues={{
            //   resource: '',
            //   workCenter: '',
            //   operation: '',
            //   operationVersion: '',
            //   material: '',
            //   materialVersion: '',
            //   cycleTime: '',
            //   manufacturedTime: '',
            // }}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Row gutter={64}>
              {/* First Column */}
              <Col span={12} style={{ paddingRight: '50px' }} >
                <Form.Item
                  label={t("resource")}
                  name="resource"
                  initialValue=""
                  rules={[{ required: false, message: "Resource is required" }]}
                >
                  <Input
                    placeholder=""
                    suffix={<GrChapterAdd onClick={() => handleBrowseClick("resource")} />}
                    onKeyDown={(e) => {
                      if (!/^[a-zA-Z0-9_]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => handleInputChange("resource", e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label={t("operation")}
                  name="operation"
                  initialValue=""
                  rules={[{ required: false, message: "Operation is required" }]}
                >
                  <Input
                    placeholder=""
                    suffix={<GrChapterAdd onClick={() => handleBrowseClick("operation")} />}
                    onKeyDown={(e) => {
                      if (!/^[a-zA-Z0-9_]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => handleInputChange("operation", e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label={t("material")}
                  name="material"
                  initialValue=""
                  rules={[{ required: false, message: "Material is required" }]}
                >
                  <Input
                    placeholder=""
                    suffix={<GrChapterAdd onClick={() => handleBrowseClick("material")} />}
                    onKeyDown={(e) => {
                      if (!/^[a-zA-Z0-9_]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      handleInputChange("material", e.target.value);
                      setMaterial(e.target.value);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={t("cycleTime")}
                  name="cycleTime"
                  // rules={[{ required: !isCycleTimeDisabled, message: 'Please input the cycle time!' }]}
                  required={!isCycleTimeDisabled}
                >
                  <Input
                    placeholder=""
                    disabled={isCycleTimeDisabled}
                    onKeyDown={(e) => {
                      if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      handleInputChange("cycleTime", e.target.value);
                      setCycleTime(e.target.value);
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Second Column */}
              <Col span={12} style={{ paddingLeft: '5px' }} >
                <Form.Item
                  label={t("workCenter")}
                  name="workCenter"
                  initialValue=""
                  rules={[{ required: false, message: "Work Center is required" }]}
                >
                  <Input
                    placeholder=""
                    suffix={<GrChapterAdd onClick={() => handleBrowseClick("workCenter")} />}
                    onKeyDown={(e) => {
                      if (!/^[a-zA-Z0-9_]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => handleInputChange("workCenter", e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label={t("operationVersion")}
                  name="operationVersion"
                  initialValue=""
                  rules={[{ required: false, message: "Operation Version is required" }]}
                >
                  <Input
                    placeholder=""
                    onKeyDown={(e) => {
                      if (!/^[a-zA-Z0-9_]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => handleInputChange("operationVersion", e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label={t("materialVersion")}
                  name="materialVersion"
                  initialValue=""
                  rules={[{ required: false, message: "Material Version is required" }]}
                >
                  <Input
                    placeholder=""
                    onKeyDown={(e) => {
                      if (!/^[a-zA-Z0-9_]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      handleInputChange("materialVersion", e.target.value);
                      setMaterialVersion(e.target.value);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={t("manufacturedTime")}
                  name="manufacturedTime"
                  // rules={[{ required: !isManufacturedTimeDisabled, message: 'Please input the manufactured time!' }]}
                  required={!isManufacturedTimeDisabled}
                >
                  <Input
                    placeholder=""
                    disabled={isManufacturedTimeDisabled}
                    onKeyDown={(e) => {
                      if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      handleInputChange("manufacturedTime", e.target.value);
                      setManufacturedTime(e.target.value);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
              <Button type="primary" onClick={handleSave} htmlType="submit">
                {t('save')}
              </Button>
              <Button type="primary" onClick={handleDelete} style={{ marginLeft: "10px" }} htmlType="submit">
                {t('delete')}
              </Button>
              <Button type="default" onClick={handleClear} style={{ marginLeft: "10px" }} htmlType="submit">
                {t('clear')}
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>



      <Row justify="center"
        style={{ marginTop: '0px' }}
      >
        <Col span={24}>
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            scroll={{ y: 'calc(100vh - 430px)' }}
            style={{ width: '100%', fontSize: '13.5px' }}
            size="small"
            rowSelection={{
              type: 'radio',
              selectedRowKeys,
              onChange: (newSelectedRowKeys, selectedRows: RowData[]) => {
                if (isModified) {
                  Modal.confirm({
                    title: t('confirm'),
                    content: t('rowSelectionMsg'),
                    okText: t('ok'),
                    cancelText: t('cancel'),
                    onOk: () => {
                      setIsModified(false);
                      setPendingRowSelection({ newSelectedRowKeys, selectedRows });
                    },
                    onCancel() {
                      return;
                    },
                  });
                } else {
                  setSelectedRowKeys(newSelectedRowKeys);
                  if (selectedRows.length > 0) {
                    const rowData = selectedRows[0];
                    form.setFieldsValue({
                      resource: rowData.resource,
                      workCenter: rowData.workCenter,
                      operation: rowData.operation,
                      operationVersion: rowData.operationVersion,
                      material: rowData.material,
                      materialVersion: rowData.materialVersion,
                      cycleTime: rowData.cycleTime,
                      manufacturedTime: rowData.manufacturedTime,
                    });
                  }
                }
              },
              getCheckboxProps: (record: RowData) => ({
                disabled: record.resource === 'Disabled', // Example: Disable row selection for specific rows
                name: record.resource,
              }),
            }}
            onRow={(record: RowData) => ({
              onClick: () => {
                if (isModified) {
                  Modal.confirm({
                    title: t('confirm'),
                    content: t('rowSelectionMsg'),
                    okText: t('ok'),
                    cancelText: t('cancel'),
                    onOk: () => {
                      setIsModified(false);
                      setPendingRowSelection({
                        newSelectedRowKeys: [record.key],
                        selectedRows: [record],
                      });
                    },
                    onCancel() {
                      return;
                    },
                  });
                } else {
                  const selectedKey = record.key;
                  setSelectedRowKeys([selectedKey]);
                  setPayloadData(record);
                  form.setFieldsValue({
                    resource: record.resource,
                    workCenter: record.workCenter,
                    operation: record.operation,
                    operationVersion: record.operationVersion,
                    material: record.material,
                    materialVersion: record.materialVersion,
                    cycleTime: record.cycleTime,
                    manufacturedTime: record.manufacturedTime,
                  });
                  if (record.resource || record.workCenter || record.operation || record.operationVersion) {
                    setIsManufacturedTimeDisabled(true);
                    setIsCycleTimeDisabled(false);
                  }
                  else {
                    setIsManufacturedTimeDisabled(false);
                    setIsCycleTimeDisabled(true);
                  }
                }
              },
            })}
          />



        </Col>
      </Row>


      <Modal
        // title={t(selectedField)}
        title={selectedField ? t(`select${selectedField.charAt(0).toUpperCase() + selectedField.slice(1)}`) : ''}

        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          onRow={(record) => ({
            onDoubleClick: () => handleModalOk(record),
          })}
          columns={modalColumns}
          dataSource={modalTableData}
          rowKey="id" // Use the generated id as the row key
          pagination={{ pageSize: 6 }} // Set page size to 8
        />
      </Modal>
    </div>
  );
};

export default CycleTimeForm;
