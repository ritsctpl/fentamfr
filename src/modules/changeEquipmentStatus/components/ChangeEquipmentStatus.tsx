// src/modules/activityMaintenance/components/ActivityMaintenance.tsx

'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Option } from 'antd/es/mentions';
import { Tabs, Form, Input, Button, Table, Popconfirm, Modal, Row, Col, Select, message, Drawer, Switch, DatePicker } from 'antd';
import { parseCookies } from 'nookies';
import styles from '../styles/CommonTable.module.css'; // Use the styles from the module
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import { DecodedToken } from '@modules/changeEquipmentStatus/types/changeEquipmentType';
import { getShiftData, getWCBySrc, updateResourceStatu, updateResourceStatuOee, updateResourceStatus } from '@services/equResourceService';
import { useTranslation } from 'react-i18next';
import { DynamicBrowse } from '@components/BrowseComponent';
import { RetriveResourcePod } from '@services/podServices';
import { PodConfig } from '@modules/podApp/types/userTypes';
import dayjs from 'dayjs';
import moment from 'moment';
import { retrieveAllReasonCodeBySite, defaultReasonCodeData, retrieveAllReasonCodeByResource } from '@services/reasonCodeService';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';



interface ChangeEquipmentStatusProps {
  filterFormData: PodConfig;
  onRemoveContainer: any;
  setCall1?: (value: number) => void;
  call1?:number;
  buttonLabel: any;
}

// Define the component with typed props
const ChangeMachineStatus: React.FC<ChangeEquipmentStatusProps> = ({ filterFormData,setCall1,call1,
  onRemoveContainer, buttonLabel
}) => {
  const cookies = parseCookies();
  const { t } = useTranslation()
  const [mainForm] = Form.useForm();
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(cookies.site);
  const [operation, setOperation] = useState(filterFormData?.defaultOperation)
  const [reasonCode, setreasonCode] = useState(null)
  const [reasonCodeArray, setreasonCodeArray] = useState([])
  const [reasonCodeDefault, setreasonCodeDefault] = useState(null)
  const [uiWcOrRes, setuiWcOrRes] = useState("")
  const [uiWct, setuiWct] = useState(null)
  const [oldState, setOldState] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState("Unknown");
  const [comment, setComment] = useState(null);
  const [component, setComponent] = useState<string | undefined>();
  const [call, setCall] = useState<number | undefined>(0);
  const [form] = Form.useForm();
  const [selectedDateTime, setSelectedDateTime] = useState<moment.Moment | null>(null);
  const [downtimeType, setDowntimeType] = useState("planned");

  useEffect(() => {
    handleRetrieveFn()
  }, []);




  const fetchWorkCenterByResourceOnLoad = async () => {

    const request = {
      site: site,
      resource: filterFormData?.defaultResource
    }
    const retrieveWC = await getWCBySrc(request);
    if (!retrieveWC?.errorCode) {
      setuiWct(retrieveWC);
    }
  }

  const fetchWorkCenterByResource = async (src) => {
    const request = {
      site: site,
      resource: src
    }
    const retrieveWC = await getWCBySrc(request);
    if (!retrieveWC?.errorCode) {
      setuiWct(retrieveWC);
    }
  }

  const fetchReasonCodes = async () => {
    const request = {
      site: site,
      resource: uiWcOrRes ? [uiWcOrRes] : [filterFormData?.defaultResource]
    };
    const reasonCodes = await retrieveAllReasonCodeByResource(request);
    const payload = {
      site: site,
      resourceId: filterFormData?.defaultResource,
      workcenterId: uiWct
    }
    console.log(payload, 'payload');
    const defaultReasonCode = await defaultReasonCodeData(payload);
    console.log('Reason codes:', reasonCodes);
    setreasonCodeArray(reasonCodes);
    setreasonCodeDefault(defaultReasonCode?.reason)
  };

  const handleRetrieveFn = async () => {
    await fetchWorkCenterByResourceOnLoad();
    await fetchReasonCodes();
  }


  useEffect(() => {
    // Update local state when filterFormData changes
    setOperation(filterFormData?.defaultOperation);
    setuiWcOrRes(filterFormData?.defaultResource);

  }, [filterFormData]);

  useEffect(() => {
    fetchWorkCenterByResource(uiWcOrRes);
  }, [uiWcOrRes])

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

    // Map the TYPE to internal values (0 or 1)
    // if (value === "Enabled" || value === "Productive") {
    //   statusValue = 1;
    // } else {
    //   statusValue = 0;
    // }
    setSelectedStatus(value);
    setSelectedStatus(value);
  };


  useEffect(() => {
    const fetchShiftData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      setSite(site);
      const res = await RetriveResourcePod(site, uiWcOrRes)
      console.log(res, 'ress');
      
      // Map numeric status to readable string if needed
      let displayStatus = res.status;
      if (res.status === "0") {
        displayStatus = "Disabled";
      } else if (res.status === "1") {
        displayStatus = "Enabled";
      }

      setOldState(displayStatus);
      fetchReasonCodes();
      mainForm.setFieldsValue({
        operation: filterFormData?.defaultOperation,
        resource: filterFormData?.defaultResource,
        status: displayStatus,
        reasonCode: reasonCodeDefault
      });
    };

    fetchShiftData();
  }, [site, filterFormData?.defaultResource, call, uiWcOrRes, reasonCodeDefault, uiWct]);

  const firstInputRef = useRef<any>(null);

  useEffect(() => {
    // Add a small delay to ensure the DOM is ready
    const timeoutId = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus({ preventScroll: true });
      }
    }, 0);

    return () => clearTimeout(timeoutId); // Cleanup timeout

  }, []);


  const statusDropdown = [

    {
      "TYPE": "Unknown",
      "key": "1"
    },
    {
      "TYPE": "Productive",
      "key": "2"
    },
    {
      "TYPE": "StandBy",
      "key": "3"
    },
    {
      "TYPE": "Enabled",
      "key": "4"
    },
    {
      "TYPE": "Disabled",
      "key": "5"
    },
    {
      "TYPE": "Hold",
      "key": "6"
    },
    {
      "TYPE": "Hold Yield Rate",
      "key": "7"
    },
    {
      "TYPE": "Hold Consec NC",
      "key": "8"
    },
    {
      "TYPE": "Hold SRC Viol",
      "key": "9"
    },
    {
      "TYPE": "Hold SRC Warn",
      "key": "10"
    },
    {
      "TYPE": "Scheduled Down",
      "key": "11"
    },
    {
      "TYPE": "Unscheduled  Down",
      "key": "12"
    }
  ]
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
      setuiWcOrRes(value[0].resource);
      fetchWorkCenterByResource(value[0].resource);
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

    if (selectedDateTime == null || selectedDateTime == undefined) {
      message.error("Date time cannot be empty");
      return;
    }

    const user = cookies.rl_user_id;


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
      "logMessage": comment,
      "logEvent": selectedStatus === "Productive" || selectedStatus === "Enabled" ? "RELEASABLE" : selectedStatus !== 'UnScheduled Down' ? "SCHEDULED_DOWN" : "UNSCHEDULED_DOWN",
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
        console.log('Sending payload:', payload); // For debugging
        const res = await updateResourceStatus(payload);

        message.destroy();
        if (res.errorCode) {
          message.error(res.message);
          return;
        }
        message.success(res.message_details.msg);
        const cookies = parseCookies();
        const site = cookies.site;
        setSite(site);
        setCall(call + 1)
        if (setCall1) {
          setCall1(call1 + 1);
        }
        // const ress = await updateResourceStatu(payloadd);
        const ressOee = await updateResourceStatuOee(payloadOee);
        onRemoveContainer(buttonLabel)
        const getShift = await getShiftData(site);
        console.log(getShift, "getShift");
        // if (ress.errorCode) {
        //   message.error(ress.message);
        //   return;
        // }


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
    console.log("111");
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

  console.log(selectedStatus, "oldState");
  // "calc(100vh - 150px)" 
  return (
    <>
      <div className={styles.containers} style={{ marginTop: '10px' }}>
        <div style={{ height: "100vh" }}>
          <Form
            form={mainForm}
            layout="horizontal"
            initialValues={currentFormData}
            onValuesChange={handleValuesChange}
            style={{ width: '70%', margin: 'auto auto' }}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 14 }}
            size="small"
          >
            <div style={{
              rowGap: '0px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Form.Item
                name="operation"
                label={t('operation')}
                style={{ marginBottom: '0px', width: '100%' }}
              >
                <DynamicBrowse
                  uiConfig={uiOperation}
                  onSelectionChange={onSelectOperation}
                  initial={operation}
                  setOnChangeValue={onChangeComponent}
                  selectedInput={0}
                  style={{ height: '20px', minHeight: '20px' }}
                />
              </Form.Item>

              <Form.Item
                name="resource"
                label={t('resource')}
                rules={[{ required: true, message: t('pleaseEnterSelectBy') }]}
                style={{ marginBottom: '0px' }}
              >
                <DynamicBrowse
                  uiConfig={uiWcOrResource}
                  onSelectionChange={onSelecWcOrResource}
                  initial={uiWcOrRes}
                  setOnChangeValue={onChangeComponent}
                  style={{ height: '20px', minHeight: '20px' }}
                />
              </Form.Item>

              <Form.Item
                name="workCenter"
                label={t('workCenter')}
                style={{ marginBottom: '0px' }}
              >
                <DynamicBrowse
                  uiConfig={uiWc}
                  onSelectionChange={onSelecWc}
                  initial={uiWct}
                  setOnChangeValue={onChangeComponent}
                  style={{ height: '20px', minHeight: '20px', marginTop: '0px' }}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label={t('status')}
                style={{ marginBottom: '0px' }}
              >
                <Input
                  disabled={true}
                  defaultValue={oldState}
                  style={{ height: '20px', padding: '0px 4px', }}
                />
              </Form.Item>

              <Form.Item
                name="newStatus"
                label={t('newStatus')}
                style={{ marginBottom: '0px' }}
              >
                <Select
                  placeholder={t('selectStatus')}
                  onChange={handleStatusChange}
                  style={{ height: '20px' }}
                  dropdownStyle={{ lineHeight: '20px' }}
                >
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
                style={{ marginBottom: '0px' }}
                initialValue={reasonCodeDefault}
              >
                <Select
                  onChange={(value) => setreasonCode(value)}
                  style={{ height: '20px' }}
                  placeholder={t('selectReasonCode')}

                  dropdownStyle={{ lineHeight: '20px' }}
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
                style={{ marginBottom: '0px' }}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  onChange={handleDateTimeChange}
                  style={{ width: '100%', height: '20px' }}
                  disabledDate={(current) => current && current.isAfter(dayjs(), 'second')}
                />
              </Form.Item>

              <Form.Item
                name="downtimeType"
                label={t('downtimeType')}
                initialValue={downtimeType}
                style={{ marginBottom: '0px' }}
              >
                <Select onChange={(value) => setDowntimeType(value)} style={{ width: '100%', height: '20px' }}>
                  <Option value="planned">Planned</Option>
                  <Option value="unplanned">Unplanned</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="comment"
                label={t('comment')}
                style={{ marginBottom: '0px' }}
              >
                <Input.TextArea
                  rows={1}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ padding: '0px 4px', minHeight: '20px' }}
                />
              </Form.Item>
            </div>
            <div className={styles.submitButton} style={{ marginTop: '8px' }}>
              <Button
                type="primary"
                onClick={handleUpdate}
                size="small"
                style={{ padding: '0px 6px', height: '20px', lineHeight: '18px' }}
              >
                {t('create')}
              </Button>
              <div>
                <InstructionModal title="Change Machine Status">
                  <UserInstructions />
                </InstructionModal>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default ChangeMachineStatus;

