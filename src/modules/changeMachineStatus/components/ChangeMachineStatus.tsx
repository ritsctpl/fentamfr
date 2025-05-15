// src/modules/activityMaintenance/components/ActivityMaintenance.tsx

'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Option } from 'antd/es/mentions';
import { Tabs, Form, Input, Button, Table, Popconfirm, Modal, Row, Col, Select, message, Drawer, Switch, DatePicker } from 'antd';
import { parseCookies } from 'nookies';
import styles from '../styles/CommonTable.module.css'; // Use the styles from the module
import { decryptToken } from '@/utils/encryption';
import { useAuth } from '@context/AuthContext';
import jwtDecode from 'jwt-decode';
import { DecodedToken } from '@modules/changeEquipmentStatus/types/changeEquipmentType';
import { updateResourceStatu, updateResourceStatuOee, updateResourceStatus } from '@services/equResourceService';
import { useTranslation } from 'react-i18next';
import { DynamicBrowse } from '@components/BrowseComponent';
import { RetriveResourcePod } from '@services/podServices';
import { PodConfig } from '@modules/podApp/types/userTypes';
import CommonAppBar from '@components/CommonAppBar';
import { statusDropdown } from '../types/changeEquipmentType';
import dayjs from 'dayjs';
import moment from 'moment';
import { retrieveAllReasonCodeBySite } from '@services/activityService';
import ChangeEquipmentStatus from '@/app/rits/changeEquipmentStatus_app/page';
import ChangeMachineStatusFile from '@modules/changeEquipmentStatus/components/ChangeEquipmentStatus';

interface ChangeEquipmentStatusProps {
  filterFormData: PodConfig;
}

// Define the component with typed props
const ChangeMachineStatus: React.FC<ChangeEquipmentStatusProps> = ({ filterFormData, }) => {
  console.log(filterFormData, "filterFormData");
  const cookies = parseCookies();
  const { t } = useTranslation()
  const [mainForm] = Form.useForm();
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(cookies.site);
  const [operation, setOperation] = useState(filterFormData?.defaultOperation)
  const [reasonCode, setreasonCode] = useState(null)
  const [reasonCodeArray, setreasonCodeArray] = useState([])
  const [reasonCodeDefault, setreasonCodeDefault] = useState(null)
  const [uiWcOrRes, setuiWcOrRes] = useState(filterFormData?.defaultResource)
  const [uiWct, setuiWct] = useState(null)
  const [oldState, setOldState] = useState(null)
  const { isAuthenticated, token } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("Unknown");
  const [comment, setComment] = useState(null);
  const [component, setComponent] = useState<string | undefined>();
  const [call, setCall] = useState<number | undefined>(0);
  const [form] = Form.useForm();
  const [selectedDateTime, setSelectedDateTime] = useState<moment.Moment | null>(null);
  const [downtimeType, setDowntimeType] = useState("planned");

  useEffect(() => {
    const fetchReasonCodes = async () => {
      const reasonCodes = await retrieveAllReasonCodeBySite(site);
      console.log('Reason codes:', reasonCodes);
      setreasonCodeArray(reasonCodes);
      setreasonCodeDefault(reasonCodes[0]?.reasonCode)
    };
    fetchReasonCodes();
  }, []);

  useEffect(() => {
    // Update local state when filterFormData changes
    setOperation(filterFormData?.defaultOperation);
    setuiWcOrRes(filterFormData?.defaultResource);
    // Fetch reason codes when site changes
  }, [filterFormData]);

  // Handler for date time change
  const handleDateTimeChange = (value: dayjs.Dayjs | null) => {
    console.log(value, "value");
    if (value) {
      setSelectedDateTime(moment(value.toDate()));
    } else {
      setSelectedDateTime(null);
    }
  };

  // Handler function for when the selection changes
  const handleStatusChange = (value: string) => {
    let statusValue  // Default value
    console.log(value);

    //  // Map the TYPE to internal values (0 or 1)
    //  if (value === "Enabled" || value === "Productive") {
    //    statusValue = 1;
    //  } else {
    //    statusValue = 0;
    //  }
    setSelectedStatus(value);

    console.log('Selected Status:', value);
  };


  useEffect(() => {
    const fetchShiftData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      const cookies = parseCookies();
      const site = cookies.site;
      setSite(site);
      const res = await RetriveResourcePod(site, uiWcOrRes);

      // Map numeric status to readable string if needed
      let displayStatus = res.status;
      if (res.status === "0") {
        displayStatus = "Disabled";
      } else if (res.status === "1") {
        displayStatus = "Enabled";
      }

      setOldState(displayStatus);
      mainForm.setFieldsValue({
        operation: filterFormData?.defaultOperation,
        resource: filterFormData?.defaultResource,
        status: displayStatus
      });
    };

    fetchShiftData();
  }, [isAuthenticated, token, site, filterFormData?.defaultResource, uiWcOrRes, call]);



  // const defaultStatus = statusDropdown.length > 0 ? statusDropdown[0].TYPE : '';
  const defaultStatus = '';
  const handleValuesChange = (p0: { component: any; }) => {

  }
  const onSelectOperation = (value) => {
    console.log(value, 'fffff');
    if (value.length === 0) {
      setOperation("")
    }
    else {
      setOperation(value[0].operation)
    }

    console.log('check')
  }
  const onSelectReasonCode = (value) => {

    if (value.length === 0) {
      setreasonCode("")
    }
    else {
      setreasonCode(value[0].reasonCode)
    }

    console.log('check')
  }
  const onSelecWcOrResource = (value) => {

    if (value.length === 0) {
      setuiWcOrRes("")
    }
    else {
      setuiWcOrRes(value[0].resource)
    }

  }

  const onSelecWc = (value) => {
    if (value.length === 0) {
      setuiWct("")
    }
    else {
      setuiWct(value[0].workCenter)
    }
  }
  const currentFormData = {}
  const handleUpdate = async () => {
    // Parse cookies
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    const hasEmptyuiWcOrRes = !uiWcOrRes?.trim();

    // Display error messages if validation fails
    if (hasEmptyuiWcOrRes) {
      message.error('Resource or Work Center fields cannot be empty.');
      return;
    }

    const user = cookies.rl_user_id;
    //       const date = new Date("2024-11-01T10:00:00"); // Your input date string



    // Construct payload
    const payloadd: any = {
      workcenterId: uiWct,
      resourceId: uiWcOrRes,
      site,
      downtEvent: selectedStatus === "Productive" || selectedStatus === "Enabled" ? 1 : 0,
      defaultOperation: operation,
      dateTime: selectedDateTime ? selectedDateTime.format('YYYY-MM-DDTHH:mm:ss') : null,
      reason: reasonCode,
      commentUsr: user,
      rootCause: comment,
      downtimeType: downtimeType,
      // downtimeStart: selectedDateTime ? selectedDateTime.toISOString() : downtimeTimes.downtimeStartCurrent,
      // downtimeEnd: selectedDateTime ? selectedDateTime.add(30, 'minutes').toISOString() : downtimeTimes.downtimeEndCurrent,
      // shiftId: "SHIFT12",
    };
    const payloadOee: any = {
      "siteId": site,
      "shiftId": null,
      "shiftCreatedDateTime": null,
      "shiftBreakCreatedDateTime": null,
      "workcenterId": uiWct,
      "resourceId": uiWcOrRes,
      "itemId": "",
      "operationId": operation,
      "downEvent": selectedStatus === "Productive" || selectedStatus === "Enabled" ? 1 : 0,
      "logMessage": comment,
      "logEvent": selectedStatus === "Productive" || selectedStatus === "Enabled" ? "RELEASABLE" : "UNSCHEDULED_DOWN",
      "reason": reasonCode,
      "rootCause": comment,
      "commentUsr": user,
      "createdDateTime": selectedDateTime ? selectedDateTime.format('YYYY-MM-DDTHH:mm:ss') : null,
      "modifiedDateTime": selectedDateTime ? selectedDateTime.format('YYYY-MM-DDTHH:mm:ss') : null,
      "active": selectedStatus === "Productive" || selectedStatus === "Enabled" ? 1 : 0,
    }


    const payload: any = {
      site,
      userId,
      resource: uiWcOrRes,
      workCenter: uiWct,
      defaultOperation: operation,
      reasonCode,
      comments: comment,
      dateTime: selectedDateTime ? selectedDateTime.format('YYYY-MM-DDTHH:mm:ss') : null,
      setUpState: selectedStatus
    };

    if (uiWcOrRes) {
      try {
        console.log('Sending payload:', payload, payloadd); // For debugging
        const res = await updateResourceStatus(payload);

        message.destroy();
        if (res.errorCode) {
          message.error(res.message);
          return;
        }
        message.success(res.message_details.msg);
        setCall(call + 1)
        // const ress = await updateResourceStatu(payloadd);
        const ressOee = await updateResourceStatuOee(payloadOee);


      } catch (error) {
        console.error('Error updating resource status:', error);
        message.error('Error updating resource status. Please try again.');
      }
    }
    else {
      message.error('Fill the Form');
    }


  };
  const onChangeComponent = (newValues) => {
    setComponent(newValues);
    form.setFieldsValue({
      component: newValues.toUpperCase(),
    });

    handleValuesChange({
      component: newValues.toUpperCase(),
    });
  }

  const uiOperation: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Operation',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'api/rits/',
    tabledataApi: "operation-service"
  };
  const uiReasonCode: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Reason Code',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'site-service',
    tabledataApi: 'reasoncode-service'
  };
  const uiWcOrResource: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Resource',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'resource',
    tabledataApi: 'resource-service'
  };

  const uiWc: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Work Center',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: "workcenter-service",
    tabledataApi: "workcenter-service"
  };



  return (
    <>
      <div className={styles.containers}>
        <CommonAppBar
          onSearchChange={() => { }}
          allActivities={[]}
          username={username}
          site={null}
          appTitle={t("machineStatusChange")} onSiteChange={function (newSite: string): void {
          }} />
        {/* <div style={{ height: "90vh" }}>
          <Form
            form={mainForm}
            layout="horizontal"
            initialValues={currentFormData}
            onValuesChange={handleValuesChange}
            style={{ width: '70%', marginTop: '50px', margin: '50px auto' }}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 14 }}
          >
            <Form.Item
              name="operation"
              label={t('operation')}
            >
              <DynamicBrowse
                uiConfig={uiOperation}
                onSelectionChange={onSelectOperation}
                initial={operation}
                setOnChangeValue={onChangeComponent}
              />
            </Form.Item>


            <Form.Item
              name="resource"
              label={t('resource')}
              rules={[{ required: true, message: t('pleaseEnterSelectBy') }]}
            >
              <DynamicBrowse
                uiConfig={uiWcOrResource}
                onSelectionChange={onSelecWcOrResource}
                initial={uiWcOrRes}
                setOnChangeValue={onChangeComponent}
              />
            </Form.Item>
            <Form.Item
              name="workCenter"
              label={t('workCenter')}
            >
              <DynamicBrowse
                uiConfig={uiWc}
                onSelectionChange={onSelecWc}
                initial={uiWct}
                setOnChangeValue={onChangeComponent}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label={t('status')}
              initialValue={oldState}
            >
              <Input disabled={true} defaultValue={oldState} />
            </Form.Item>

            <Form.Item
              name="newStatus"
              label={t('newStatus')}
              initialValue={selectedStatus}
              rules={[{ required: true }]}
            >
              <Select placeholder={t('selectStatus')} onChange={handleStatusChange}>
  {statusDropdown.map(status => {
    console.log('Rendering status:', status);  // Log the status data being rendered
    return (
      <option
        key={status.key}
        value={status.TYPE}
        style={{
          backgroundColor: status.TYPE === "Enabled" || status.TYPE === "Productive" ? '#90EE90' : '#ffe6e6'
        }}
      >
        {status.TYPE}
      </option>
    );
  })}
</Select>
            </Form.Item>

            <Form.Item
              name="reasonCode"
              label={t('reasonCode')}
            >
              <Select
                onChange={(value) => setreasonCode(value)}
                style={{ width: '100%' }}
                defaultValue={reasonCodeArray[0]?.reasonCode}
                placeholder={t('selectReasonCode')}
              >
                {reasonCodeArray?.map(reason => (
                  <Option key={reason.reasonCode} value={reason.reasonCode}>
                    {reason.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="dateTime"
              label={t('dateTime')}
              rules={[{ required: true, message: t('pleaseSelectDateTime') }]}
              style={{ width: '100%' }}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                onChange={handleDateTimeChange}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="downtimeType"
              label={t('downtimeType')}
              initialValue={downtimeType}
            >
              <Select onChange={(value) => setDowntimeType(value)} style={{ width: '100%' }}>
                <Option value="planned">Planned</Option>
                <Option value="unplanned">Unplanned</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="comment"
              label={t('comment')}
            >
              <Input.TextArea rows={4} onChange={(e) => setComment(e.target.value)} />
            </Form.Item>
          </Form>
          <div className={styles.submitButton} style={{ marginTop: '20px' }}>

            <Button
              type="primary"
              onClick={handleUpdate}
            >
              {t('create')}
            </Button>
          </div>
        </div> */}
        <ChangeMachineStatusFile filterFormData={filterFormData} onRemoveContainer={() => { }} buttonLabel={""} />
      </div>
    </>
  );
};

export default ChangeMachineStatus;

