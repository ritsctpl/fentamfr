import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Form,
  message,
  Drawer,
  Tabs,
  Modal,
  Radio,
} from "antd";
import CommonAppBar from "@components/CommonAppBar";
import {
  addScheduler,
  fetchSchedularDelete,
  fetchSchedulerAll,
  fetchSchedulerOutput,
  updateScheduler,
} from "@services/schedulerOld";
import type { ColumnsType } from "antd/es/table";
import { parseCookies } from "nookies";
import jwtDecode from "jwt-decode";
import { decryptToken } from "@utils/encryption";
import { useAuth } from "@context/AuthContext";
import { DecodedToken, IntervalSchedulerConfig } from "../types/schedulerTypes";
import { useTranslation } from "react-i18next";
import SchedulerForm from "./SchedulerForm";
import "../styles/SchedulerMaintenance.css";
import History from "./History";
import ExecutionSchedule from "./ExecutionSchedule";
import { HistoryOutlined } from "@ant-design/icons";
import InstructionModal from "@components/InstructionModal";
import SchedularManual from "./SchedulerManual";

const { TabPane } = Tabs;

interface PhasesStepsProps {
  formDatas: any;
}

const SchedulerMaintenance: React.FC<PhasesStepsProps> = ({ formDatas }) => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuth();
  const [scheduler, setScheduler] = useState<IntervalSchedulerConfig[]>([]);
  const [isStepModalVisible, setIsStepModalVisible] = useState(false);
  const [editStepMode, setEditStepMode] = useState(false);
  const [editingStep, setEditingStep] =
    useState<IntervalSchedulerConfig | null>(null);
  const [form] = Form.useForm();
  const [username, setUsername] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] =
    useState<IntervalSchedulerConfig | null>(null); // To store selected row data
  const [call, setCall] = useState(0);
  const [historyData, setHistoryData] = useState([]);
  const [activeTabKey, setActiveTabKey] = useState("1"); // Add new state for active tab
  const [disableTab,setDisableTab] = useState(false)

  const schedulerColumns: ColumnsType<IntervalSchedulerConfig> = [
    {
      title: t("select"),
      dataIndex: "entityId",
      ellipsis: true,
      width:"100px",
      key: "select",
      render: (entityId: number, record: IntervalSchedulerConfig) => (
        <Radio
          value={entityId}
          checked={selectedRowData?.entityId === entityId}
          onChange={() => setSelectedRowData(record)}
        />
      ),
    },
    { 
      title: t("entityName"), 
      dataIndex: "entityName", 
      ellipsis: true,
      key: "entityName",
      render: (text: string) => text || '-'
    },
    { 
      title: t("entityType"), 
      dataIndex: "entityType", 
      ellipsis: true,
      key: "entityType",
      render: (text: string) => text || '-'
    },
    {
      title: t("eventIntervalSeconds"),
      dataIndex: "eventIntervalSeconds",
      ellipsis: true,
      key: "eventIntervalSeconds",
      render: (text: string) => text || '-'
    },
    {
      title: t("cronExpression"),
      dataIndex: "cronExpression",
      ellipsis: true,
      key: "cronExpression",
      render: (text: string) => text || '-'
    },
    { 
      title: t("enable"), 
      dataIndex: "enabled", 
      ellipsis: true,
      key: "enabled",
      render: (text: string) => text || '-'
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      ellipsis: true,
      render: (status: string) => {
        if (!status) return '-';
        const statusStyle = status === "Running" ? { color: "green" } : { color: "red" };
        return <span style={statusStyle}>{status}</span>;
      },
    },
    {
      title: t("history"),
      key: "history",
      width: "100px",
      render: (_, record) => (
        <HistoryOutlined 
          className="history-icon"
          onClick={() => handleViewHistory(record)}
          disabled={!record.id}
          style={{ 
            color: record.id ? '#1890ff' : '#d9d9d9',
            cursor: record.id ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    const fetchShiftData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
      const cookies = parseCookies();
      const site = cookies.site;
      setSite(site);

      try {
        const userData = await fetchSchedulerAll(site);
        console.log(userData, "userData");

        let updatedData = userData.map((item) => ({
          id: item.id,
          entityName: item.entityName,
          entityType: item.entityType,
          apiEndpoint: item.apiEndpoint,
          eventIntervalSeconds: item.eventIntervalSeconds,
          apiInput: item.apiInput,
          cronExpression: item.cronExpression,
          includeRunTime:item.includeRunTime,
          enabled: item.enabled ? "True" : "False",
          status: item.enabled ? "Running" : "Stopped",

          entityId: String(item.entityId), // Ensure entityId is always a string
        }));
        setScheduler(updatedData || []);
        let filterData = updatedData.filter(
          (data) => data.entityId === selectedRowData.entityId
        );
        setSelectedRowData(filterData[0]);
      } catch (error) {
        console.error("Error fetching schedular:", error);
      }
    };

    fetchShiftData();
  }, [isAuthenticated, token, call]);

  const handleRemoveSelectedSteps = () => {
    if (selectedRowData) {
      Modal.confirm({
        title: `${t("areYouSure")} ${selectedRowData.entityId}?`,
        okText: t("delete"),
        okType: "danger",
        cancelText: t("cancel"),
        onOk: async () => {
          const cookies = parseCookies();
          const site = cookies.site;
          const entityId = selectedRowData.id;

          const response = await fetchSchedularDelete(site, entityId);
          setSelectedRowData(null)
          console.log(response, "deleteResponse");

          // const ResponseMessage = response.message_details.msg;
          const ResponseMessage = "Deleted Successfully";

          message.success(ResponseMessage);
          setCall(call + 1);
        },
      });
    }
  };

  const handleAddStep = () => {
    // Step 1: Reset editing and form fields
    setEditStepMode(false);
    setHistoryData([]);
    setEditingStep(null);
    setSelectedRowData(null); // Clear selected row data

    // Step 2: Reset form fields completely
    form.resetFields();

    // Step 3: Generate a unique entityId for the new scheduler
    form.setFieldsValue({ entityId: Date.now() % 2147483647 ,includeRunTime:true});

    // Step 4: Show the modal after the state has been reset
    setIsStepModalVisible(true);
  };

  const handleEditStep = async () => {
    if (selectedRowData) {
      setEditStepMode(true);
      form.setFieldsValue(selectedRowData);
      setIsStepModalVisible(true);
      setEditingStep(selectedRowData);
    } else {
      message.warning("Please select a step to edit");
    }
    try{
      const historyData = await fetchSchedulerOutput(selectedRowData.id);
      console.log(historyData, "fetchSchedulerOutput");
      // Sort by executionTime in descending order (most recent first)
      const sortedHistoryData = historyData ? [...historyData].sort((a, b) => 
        new Date(b.executionTime).getTime() - new Date(a.executionTime).getTime()
      ) : [];
      setHistoryData(sortedHistoryData);
    }
    catch(error){
      console.log(error, "error");
    }
  };

  const handleModalOkStep = async () => {
    setDisableTab(false)
    setActiveTabKey("1");
    const values = await form.validateFields();
    console.log(values, "values");
    
    let updatedSteps;

    if (editStepMode && editingStep) {
      const cookies = parseCookies();
      const userId = cookies.site;

      const payload = {
        id: selectedRowData.id,
        ...values,
      };
      console.log(payload, "payloadd");
      const res = await updateScheduler(userId, payload);
      console.log(res);

      if (res.errorCode) {
        message.error(res.message);
        return;
      }

      message.success("Updated");
      setSelectedRowData(null);
    form.resetFields();
      setCall(call + 1);
    } else {
      updatedSteps = [...scheduler, { ...values, entityId: Date.now() }];
      const cookies = parseCookies();
      const userId = cookies.rl_user_id;
      const site = cookies.site;
      const payload = {
        entityId: Date.now() % 2147483647, // Use max int32 value to ensure we stay within safe integer range
        ...values,
      };
      console.log(payload, "592");

      const res = await addScheduler(site, payload);
      console.log(res, "592");
      if (res.errorCode) {
        message.error(res.message);
        return;
      }
      message.success("Running");
      setCall(call + 1);
      setSelectedRowData(null);
    form.resetFields();
    }

    setScheduler(updatedSteps);
    form.resetFields();
    setIsStepModalVisible(false);
  };

  const handleRun = async () => {

    if(selectedRowData===null){
      return message.warning("Please select a step to run");
    }
    // console.log(selectedRowData);
    if (!selectedRowData) return;
    let check = selectedRowData.enabled;

    if (!check) {
      const cookies = parseCookies();
      const userId = cookies.rl_user_id;
      let res;
      if (selectedRowData.entityType === "CRONO") {
        const {
          status,
          eventIntervalSeconds,
          entityId,
          ...payloadWithoutStatus
        } = selectedRowData;
        const payload = {
          ...payloadWithoutStatus,
          enabled: true,
        };
        console.log(payload, "payloadd");

        res = await updateScheduler(userId, payload);
      } else {
        const { status, cronExpression, entityId, ...payloadWithoutStatus } =
          selectedRowData;
        const payload = {
          ...payloadWithoutStatus,
          enabled: true,
        };
        console.log(payload, "payloadd");

        res = await updateScheduler(userId, payload);
      }

      if (res.errorCode) {
        message.error(res.message);
        return;
      }

      message.success("Updated");
      setCall(call + 1);
      setSelectedRowData(null);
    } else {
      message.success("Its already Running");
    }
  };
  const handleStop = async () => {
    if(selectedRowData===null){
      return message.warning("Please select a step to stop");
    }
    // console.log(selectedRowData);
    let check = String(selectedRowData.enabled);

    if (check) {
      const cookies = parseCookies();
      const userId = cookies.rl_user_id;
      let res;
      if (selectedRowData.entityType === "CRONO") {
        const {
          status,
          eventIntervalSeconds,
          entityId,
          ...payloadWithoutStatus
        } = selectedRowData;
        const payload = {
          ...payloadWithoutStatus,
          enabled: false,
        };
        console.log(payload, "payloadd");

        res = await updateScheduler(userId, payload);
      } else {
        const { status, cronExpression, entityId, ...payloadWithoutStatus } =
          selectedRowData;
        const payload = {
          ...payloadWithoutStatus,
          enabled: false,
        };
        console.log(payload, "payloadd");

        res = await updateScheduler(userId, payload);
      }
      if (res.errorCode) {
        message.error(res.message);
        return;
      }

      message.success("Stopped");
      setCall(call + 1);
      setSelectedRowData(null);
    } else {
      message.success("Its already Stopped");
    }
  };

  const handleModalCancelStep = () => {
    setIsStepModalVisible(false);
    setDisableTab(false)
    setActiveTabKey("1");
    setSelectedRowData(null);
    form.resetFields();
  };

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
  };
  console.log(selectedRowData, "selectedRowData");
  const handleRowClick = async (record) => {
    console.log(record,"record");
    
    let updatedData = {
      ...record, // Spread the data of the clicked row (not 'item')
      enabled: record.enabled === "True" ? true : false, // Convert string "True"/"False" to boolean
    };
    setSelectedRowData(updatedData);
   
  };

  const handleViewHistory = async (record) => {
    setIsStepModalVisible(true);
    setSelectedRowData(record);
    setEditStepMode(true);
    setActiveTabKey("2");
    setDisableTab(true)
    try {
      const historyData = await fetchSchedulerOutput(record.id);
      console.log(historyData, "historyData");
      const sortedHistoryData = historyData ? [...historyData].sort((a, b) => 
        new Date(b.executionTime).getTime() - new Date(a.executionTime).getTime()
      ) : [];

      console.log(sortedHistoryData, "sortedHistoryData");
      
      setHistoryData(sortedHistoryData);
    } catch(error) {
      console.log(error, "error");
    }
  };

  return (
    <div>
      <CommonAppBar
        allActivities={[]}
        username={username}
        site={site}
        appTitle={`${t("schedulerMaintenance")}`}
        onSiteChange={handleSiteChange}
        onSearchChange={() => {}}
      />
      <br />

      

      <Table
        rowKey="entityId"
        columns={schedulerColumns}
        dataSource={scheduler}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        pagination={false}
        scroll={{ y: 'calc(100vh - 230px)' }}
        size="small"
        rowClassName={(record) =>
          record.entityId === selectedRowData?.entityId ? "selected-row" : ""
        }
        bordered={true}
      />

      <Space
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "16px",
        }}
      >
        <Button
          type="default"
          className="butnScheduler"
          onClick={handleAddStep}
          // disabled={selectedRowData===null}
        >
          {t("create")}
        </Button>
        <Button
          type="default"
          className="butnScheduler"
          onClick={handleEditStep}
          disabled={!selectedRowData}
        >
          {t("edit")}
        </Button>
        <Button type="default" className="butnScheduler" onClick={handleRun}>
          {t("runJob")}
        </Button>
        <Button type="default" className="butnScheduler" onClick={handleStop}>
          {t("stopScheduler")}
        </Button>
        <Button
          type="default"
          onClick={handleRemoveSelectedSteps}
          disabled={!selectedRowData}
          className="butnScheduler"
        >
          {t("delete")}
        </Button>
        <Button
          type="default"
          onClick={handleModalCancelStep}
          className="butnScheduler"
        >
          {t("clear")}
        </Button>
        <div style={{display:'flex', padding:'10px'}}>     
           <InstructionModal  title='Scheduler Maintenance'>
      <SchedularManual />
     </InstructionModal>
      </div> 
      </Space>

      <Drawer
        title="Details for Test"
        visible={isStepModalVisible}
        closable={false}
        width={"60%"}
        onClose={() => {
          setActiveTabKey("1");
          // setDisableTab(false);
        }}
        extra={
          <Space>
            <Button onClick={handleModalCancelStep}>Cancel</Button>
            <Button type="primary" onClick={handleModalOkStep} disabled={disableTab}>
              {t("ok")}
            </Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          style={{ paddingTop: "0px" }}
        >
          <TabPane tab={t("Transaction Scheduler")} key="1">
            <SchedulerForm
              form={form}
              editStepMode={editStepMode}
              editingStep={selectedRowData}
              onSave={handleModalOkStep}
              onCancel={handleModalCancelStep}
              disableTab={disableTab}
            />
          </TabPane>
          <TabPane tab={t("History")} key="2"><History historyData={historyData} setHistoryData={setHistoryData} selectedRowData={selectedRowData}  /></TabPane>
          {/* <TabPane tab={t("Execution Scheduler")} key="3">
            <ExecutionSchedule/>
          </TabPane> */}
        </Tabs>
      </Drawer>
    </div>
  );
};

export default SchedulerMaintenance;
