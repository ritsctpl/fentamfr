import React, { useState, useRef, useEffect } from "react";
import { Col, Row, Pagination, Button, Card, Dropdown, Menu, Spin } from "antd";
import { Content } from "antd/es/layout/layout";
import GaugeChart from "../oee/GaugeChart";
import { Box } from "@mui/material";
import styles from "./tileOee.module.css";
import { useFilterContext } from "@modules/oee_process/hooks/filterData";
import TileOee from "./TileOee";
import { parseCookies } from "nookies";
import { oeeTileData, oeeTileDataFilter } from "@services/oeeServices";
import { log } from "node:console";
import NotFound from "./NotFound";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
const ITEMS_PER_PAGE = 12;

interface LiveOeeData {
  downloadAllPDF: () => void;
}

const LiveOee: React.FC = () => {
  const { color } = useFilterContext();
  const searchParams = useSearchParams();
  const { liveOeeData } = useFilterContext();
  const [isZoomed, setIsZoomed] = useState(false);
  // Pagination Logic //
  const [currentPage, setCurrentPage] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);  // Set loading to false initially
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState<number>(5);
  const [seconds, setSeconds] = useState(Number(searchParams.get('seconds'))*1000 || 20000);
  // Simulate data refresh every 5 seconds
  const { overallfilter } = useFilterContext();



  useEffect(() => {
    const fetchOeeData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      setLoading(true);  // Start loading
      try {
        const request = {
          site: site,
          workcenterId: overallfilter?.Workcenter?.length > 0 ? overallfilter.Workcenter : null,
          resourceId: overallfilter?.Resource?.length > 0 ? overallfilter.Resource : null,
          startTime: overallfilter?.TimePeriod ? dayjs(overallfilter.TimePeriod[0]).format('YYYY-MM-DDTHH:mm:ss') : null,
          endTime: overallfilter?.TimePeriod ? dayjs(overallfilter.TimePeriod[1]).format('YYYY-MM-DDTHH:mm:ss') : null,
          shiftId: overallfilter?.Shift?.length > 0 ? overallfilter.Shift : null,
          batchno: overallfilter?.BatchNumber?.length > 0 ? overallfilter.BatchNumber : null,

        };
        console.log(request, "request");

        const response = await oeeTileDataFilter(request);
        setData(Array.isArray(response) ? response : response.errorCode?[] : [response]);
        console.log("ResponseOEE: ", response);
      } catch (error) {
        console.log("Error: ", error);
      } finally {
        setLoading(false);  // Set loading to false after data is fetched
      }
    };

    // Run immediately and then every 5 seconds
    const interval = setInterval(fetchOeeData, seconds);
    fetchOeeData();


    // Cleanup interval on component unmount or dependency change
    return () => clearInterval(interval);
  }, [liveOeeData, overallfilter]);

  useEffect(() => {
    const checkZoom = () => {
      setIsZoomed(window.devicePixelRatio > 1.5);
    };
    window.addEventListener("resize", checkZoom);
    checkZoom(); // Check initial state
    return () => window.removeEventListener("resize", checkZoom);
  }, []);

  const data1 = liveOeeData.oee || 67.5;
  const data2 = 60;
  const data3 = 40;
  const data4 = 90;

  // Calculate total number of items and pages
  const totalItems = liveOeeData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Calculate the start and end index for slicing the data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Content ref={contentRef} style={{ padding: "0 50px", marginTop: "20px" }}>
      <div className="site-layout-content">
        <Box ref={contentRef} className={styles.tileWrapper}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width:'100%',
                height: "100vh",  // Ensure it takes the full viewport height to center vertically
                textAlign: "center",  // Align text center in case it's needed for message
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
            data.length!==0? data?.map((item, index) => <TileOee key={index} item={item} currentItem={data} />):<NotFound/>
          )}
        </Box>
        {totalItems > ITEMS_PER_PAGE && !loading && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <Pagination
              current={currentPage}
              pageSize={ITEMS_PER_PAGE}
              total={totalItems}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </Content>
  );
};

export default LiveOee;
