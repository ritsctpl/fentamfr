import React, { useEffect, useState } from "react";
import { Button, message, Modal, Switch, Table, Input } from "antd";
import styles from "@modules/logBuyOff/styles/LogBuyOff.module.css";
import { PodConfig } from "@modules/podApp/types/userTypes";

import { parseCookies } from "nookies";
import { useTranslation } from "react-i18next";
import BuyOffList from "./BuyOffList";
import { LogBuyOffContext } from "../hooks/logBuyOffContext";
import UserLogin from "./UserLogin";
import { v4 as uuidv4 } from "uuid";
import {
  acceptBuyOff,
  getListOfBuyoff,
  partialBuyOff,
  rejectBuyOff,
  retrieveOperation,
  retrievePCUInWork,
  skipBuyOff,
  retrievePCUInQueue,
} from "@services/logBuyOffService";
import { retrieveBatchNumberHeader } from "@services/holdunholdServices";

const { TextArea } = Input;
const cookies = parseCookies();

const LogBuyOff: React.FC<any> = ({
  buttonLabel,
  onCloseModal,
  onRemoveContainer,
  filterFormData,
  selectedRowData,
  call1,
  setCall1,
  call2,
  setCall2,
  setSelectedContainer,
}) => {
  console.log("selectedRowData", selectedRowData);
  // Combine related state declarations
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  // Use optional chaining for better readability
  const shopOrder = selectedRowData?.[0]?.shopOrder;
  const pcu = selectedRowData?.[0]?.pcu;
  const [activeRowKeys, setActiveRowKeys] = useState<any>([]); // Add state to manage selected row keys
  const [selectedRow, setSelectedRow] = useState<any>();
  const [showUserLogin, setShowUserLogin] = useState<boolean>(false);
  const [buyoffList, setBuyoffList] = useState<any>([]);
  const [comments, setComments] = useState<string>("");
  const [reloadBuyOffList, setReloadBuyOffList] = useState<number>(0);
  const [reloadBuyOff, setReloadBuyOff] = useState<boolean>(false);
  const [selectedRowKey, setSelectedRowKey] = React.useState<string | null>(
    null
  );
  const [batchNodata, setBatchNodata] = useState<string[]>([]);
  const [logbuyOffRequestList, setLogbuyOffRequestList] = useState<any>([]);
  var selectedBuyOffRow;

  useEffect(() => {
    const fetchData = async () => {
      const batchNumbers = selectedRowData.map((item: any) => item.batchNo);
      if (batchNumbers.length > 0) {
        setBatchNodata(batchNumbers);
      }
      if (call2 || filterFormData || selectedRowData) {
        // Add condition to check for changes
        setShowUserLogin(true);
        setBuyoffList([]);
        setActiveRowKeys([]);
        setComments("");
      }
    };

    setSelectedRow(null);

    fetchData();
  }, [call2, filterFormData, selectedRowData]);

  const fetchBuyoffList = async () => {
    let operationVersion;
    const cookies = parseCookies();
    const site = cookies.site;
    const pcu = filterFormData?.pcu || selectedRowData?.[0]?.pcu;
    const operation = filterFormData?.defaultOperation;
    const shopOrder = selectedRowData?.[0]?.shopOrder;
    const item = selectedRowData?.[0]?.item?.split("/")[0];
    const itemVersion = selectedRowData?.[0]?.item?.split("/")[1];
    const src =
      filterFormData?.defaultResource || selectedRowData?.[0]?.defaultResource;
    const routing = selectedRowData?.[0]?.router?.split("/")[0];
    const routingVersion = selectedRowData?.[0]?.router?.split("/")[1];

    try {
      const response = await retrieveOperation({
        site: site,
        operation: operation,
      });
      operationVersion = response.revision;
    } catch (error) {
      console.log("Operation Error", error);
    }

    const request = {
      site: site,
      batchNo: selectedRowData[0]?.batchNo,
      operation: operation,
      operationVersion: operationVersion,
      shopOrder: shopOrder,
      userId: cookies.rl_user_id,
      item: item,
      itemVersion: selectedRowData[0]?.itemVersion,
      resource: src,
      routing: routing,
      routingVersion: routingVersion,
      ...selectedRowData[0],
    };
    // debugger
    console.log("Buyoff List Request", request);
    try {
      console.log("Buyoff List Response", request);
      let buyOffResponse = await getListOfBuyoff(request);

      if (!buyOffResponse?.errorCode) {
        buyOffResponse = buyOffResponse?.map((oItem, index) => ({
          ...oItem,
          buyOff: oItem?.buyOffBO?.split(",")[1],
          userBO: oItem?.userBO?.split(",")[1],
          pcuBO: oItem?.pcuBO?.split(",")[1],
          key: index,
        }));

        setBuyoffList(buyOffResponse);
      }
    } catch (error) {
      console.log("Buyoff List Error", error);
    }
  };

  useEffect(() => {
    // if(reloadBuyOff){
    fetchBuyoffList();
    // }
  }, [reloadBuyOffList, filterFormData, selectedRowData, call2, reloadBuyOff]);

  const handleButton = async (type: any) => {
    message.destroy();
    setCall1(call1 + 1);
    console.log("Selected Buy Off Row", selectedRow);
    const cookies = parseCookies();
    const site = cookies?.site;
    const user = cookies?.rl_user_id;
    const uniqueRandomInt = Math.floor(Math.random() * 1000000);
    const batchNo = batchNodata;

    if (batchNo == undefined || batchNo == null || batchNo.length == 0) {
      message.error("Batch Number cannot be empty");
      return;
    }

    if (selectedRow) {
      const operationVersion = await getOperationVersion(
        filterFormData?.defaultOperation
      );

      // Create a new array to collect all requests
      const requestList = [];

      // Use a for...of loop instead of forEach to work with async/await properly
      for (const selectedRowitem of selectedRowData) {
        const buyOff = selectedRow?.buyOffBO;
        const shopOrder = selectedRowitem.shopOrder;
        const item = selectedRowitem.material;
        const itemVersion = selectedRowitem.materialVersion;
        const resource = filterFormData?.defaultResource;
        const operation = filterFormData?.defaultOperation;

        const batchNumberHeaderRequest = {
          site: site,
          batchNumber: selectedRowitem.batchNo,
          orderNo: selectedRowitem.orderNumber,
        };
        const batchNumberHeader = await retrieveBatchNumberHeader(
          batchNumberHeaderRequest
        );
        const request = {
          site: site,
          buyOffBO: buyOff,
          // "batchNo": selectedRowitem.batchNo,
          comments: comments,
          description: selectedRow?.description,
          operation: operation,
          shopOrder: shopOrder,
          item: item,
          itemVersion: itemVersion,
          resourceId: resource,
          userId: cookies?.rl_user_id,
          buyOffLogId: selectedRow?.buyOffLogId,
          quantity: filterFormData?.qtty || selectedRowitem.qty,
          qtyToComplete: null,
          ...selectedRowitem,
          uniqueId: (Date.now() % 1e6).toString() + Math.floor(Math.random() * 100).toString(),
          recipe: batchNumberHeader?.response?.recipeName,
          recipeVersion: batchNumberHeader?.response?.recipeVersion,
        };
        request.operationVersion = operationVersion;
        requestList.push(request);
      }

      // Set the state with the complete request list
      setLogbuyOffRequestList(requestList);

      console.log("Accept Request", requestList);
      try {
        let response;
        if (type === "accept") {
          response = await acceptBuyOff({ logbuyOffRequestList: requestList });
        } else if (type === "reject") {
          response = await rejectBuyOff({ logbuyOffRequestList: requestList });
          setCall1(call1 + 1); setCall2(call2 + 1);
        } else if (type === "partial") {
          response = await partialBuyOff({ logbuyOffRequestList: requestList });
        } else if (type === "skip") {
          response = await skipBuyOff({ logbuyOffRequestList: requestList });
        }
        console.log("Response", response);
        if (response?.errorCode) {
          message.error(response?.message);
        } else {
          if (type === "accept") {
            console.log("Selected Container", buttonLabel);
            // onRemoveContainer(buttonLabel)
            // setSelectedContainer(null)
            setReloadBuyOffList(reloadBuyOffList + 1);
            setSelectedRowKey(null);
            setComments("");
            setSelectedRow(null);
          } else {
            setReloadBuyOffList(reloadBuyOffList + 1);
            setSelectedRowKey(null);
            setComments("");
            setSelectedRow(null);
          }
          message.success(response?.messageDetails?.msg);
        }
      } catch (error) {
        console.log("Error", error);
      }
    }
  };

  const getOperationVersion = async (operation: any) => {
    const cookies = parseCookies();
    const site = cookies?.site;
    debugger;
    try {
      const response = await retrieveOperation({
        site: site,
        operation: operation,
      });
      if (!response?.errorCode) {
        return response?.revision;
      }
    } catch (error) {
      console.log("Error retrieving operation", error);
    }
  };

  const getQtyToComplete = async (record) => {
    const cookies = parseCookies();
    const site = cookies?.site;
    const status = record?.[0]?.Status || record?.Status;
    if (status.includes("In Queue")) {
      try {
        const pcuInQueue = await retrievePCUInQueue({
          batchNo: record?.[0]?.batchNo,
          site: site,
        });
        console.log("PCU In Queue", pcuInQueue);
        return pcuInQueue?.[0]?.qtyToComplete;
      } catch (error) {
        console.log("PCU In Queue Error", error);
      }
    } else {
      try {
        const pcuInWork = await retrievePCUInWork({
          batchNo: record?.[0]?.batchNo,
          site: site,
        });
        console.log("PCU In Work", pcuInWork);
        return pcuInWork?.qtyToComplete;
      } catch (error) {
        console.log("PCU In Work Error", error);
      }
    }
  };

  return (
    <LogBuyOffContext.Provider
      value={{
        selectedRow,
        setSelectedRow,
        showUserLogin,
        setShowUserLogin,
        buyoffList,
        setBuyoffList,
        comments,
        setComments,
        selectedBuyOffRow,
        reloadBuyOffList,
        setReloadBuyOffList,
        selectedRowKey,
        setSelectedRowKey,
        reloadBuyOff,
        setReloadBuyOff,
      }}
    >
      {/* <div className={styles.container}> */}

      <div style={{ marginTop: "20px", height: "calc(100vh - 150px)" }}>
        <div>
          <BuyOffList
            call2={call2}
            filterFormData={filterFormData}
            selectedRowData={selectedRowData}
          />
          {/* < UserLogin /> */}
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "0 15px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <label style={{ whiteSpace: "nowrap" }}>
            {t("comments")} <span style={{ color: "red" }}>*</span>
          </label>
          <TextArea
            autoSize={{ minRows: 1, maxRows: 3 }}
            style={{ flex: 1 }}
            onChange={(e) => setComments(e.target.value)}
            value={comments}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            // padding: '15px',
            // backgroundColor: 'white',
            marginTop: "10px", // Add spacing above buttons
            // borderTop: '1px solid #f0f0f0',  // Optional: adds a subtle separator
            width: "100%",
          }}
        >
          <Button
            type="primary"
            onClick={() => handleButton("accept")}
            disabled={!(comments.trim() && selectedRowKey)}
            size="small"
            style={{ fontSize: "12px" }}
          >
            {t("accept")}
          </Button>
          <Button
            type="primary"
            onClick={() => handleButton("reject")}
            disabled={!(comments.trim() && selectedRowKey)}
            size="small"
            style={{ fontSize: "12px" }}
          >
            {t("reject")}
          </Button>
          {/* <Button type="primary" onClick={() => handleButton("partial")} size='small' style={{ fontSize: '12px' }}>{t('partial')}</Button>
                        <Button type="primary" onClick={() => handleButton("skip")} size='small' style={{ fontSize: '12px' }}>{t('skip')}</Button> */}
          {/* <Button onClick={() => handleClose()}>{t('close')}</Button> */}
        </div>
      </div>

      {/* </div> */}
    </LogBuyOffContext.Provider>
  );
};

export default LogBuyOff;
