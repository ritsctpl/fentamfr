import React, { useState, useRef, useEffect } from "react";
import { Col, Row, Pagination, Button, Card, Dropdown, Typography  } from "antd";
import { Content } from "antd/es/layout/layout";
import GaugeChart from "../oee/GaugeChart";
import { Box } from "@mui/material";
import styles from "./tileOee.module.css";
import { useFilterContext } from "@modules/oee_process/hooks/filterData";
import TileOee from "./TileOee";
import LiveOeeWorkcenter from "./LiveOeeWorkcenter1";
import { ArrowLeftOutlined } from "@mui/icons-material";
const ITEMS_PER_PAGE = 12;
const { Title } = Typography;
const initialData = [
  // {
  //   overAllOee:"69"
  // },
  {
    resource: "Site 1",
    oee: 67.5,
    availability: 85,
    performance: 75,
    quality: 90,
    downtime: false,
    itemDetails: {
      item: "",
      actual: 145,
      plan: 150,
      rejection: 10,
      productionTime: 40000,
      actualTime: 38000,
      downtime: 2000,
      goodQualityCount: 135,
      badQualityCount: 5,
    },
  },
  {
    resource: "Site 2",
    oee: 58.0,
    availability: 70,
    performance: 80,
    quality: 90,
    downtime: true,
    itemDetails: {
      item: "",
      actual: 125,
      plan: 130,
      rejection: 15,
      productionTime: 35,
      actualTime: 30,
      downtime: 5,
      goodQualityCount: 110,
      badQualityCount: 10,
    },
  },
  {
    resource: "Site 3",
    oee: 75.0,
    availability: 90,
    performance: 85,
    quality: 100,
    downtime: false,
    itemDetails: {
      item: "",
      actual: 138,
      plan: 140,
      rejection: 0,
      productionTime: 45,
      actualTime: 43,
      downtime: 2,
      goodQualityCount: 138,
      badQualityCount: 0,
    },
  },
  {
    resource: "Site 4",
    oee: 50.0,
    availability: 60,
    performance: 70,
    quality: 80,
    downtime: true,
    itemDetails: {
      item: "",
      actual: 150,
      plan: 160,
      rejection: 20,
      productionTime: 50,
      actualTime: 40,
      downtime: 10,
      goodQualityCount: 130,
      badQualityCount: 20,
    },
  },
  {
    resource: "Site 5",
    oee: 82.0,
    availability: 95,
    performance: 85,
    quality: 95,
    downtime: false,
    itemDetails: {
      item: "",
      actual: 118,
      plan: 120,
      rejection: 5,
      productionTime: 30,
      actualTime: 28,
      downtime: 2,
      goodQualityCount: 113,
      badQualityCount: 5,
    },
  },
  {
    resource: "Site 6",
    oee: 45.0,
    availability: 55,
    performance: 65,
    quality: 70,
    downtime: true,
    itemDetails: {
      item: "",
      actual: 130,
      plan: 140,
      rejection: 15,
      productionTime: 60,
      actualTime: 50,
      downtime: 10,
      goodQualityCount: 115,
      badQualityCount: 15,
    },
  },
];


const LiveOeeSite: React.FC = () => {
  const { color } = useFilterContext();
  const { liveOeeData } = useFilterContext();
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSetShow, setisSetShow] = useState(true);
  //Pagination Logic//
  const [currentPage, setCurrentPage] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentItem, setCurrentItem] = useState([]);
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState<number>(5);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const liveOeeRef = useRef(null);
  // Simulate data refresh every 5 seconds
  useEffect(() => {
    // If you want to scroll the specific contentRef container
    if (contentRef.current) {
      setTimeout(() => {
        contentRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start", // Scroll to the top of the container
        });
      }, 100); // Delay for smooth scroll after render
    } else {
      // If you need to scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: "smooth", // Smooth scroll to the top
      });
    }
  }, [selectedItem]);
  useEffect(() => {
    const interval = setInterval(() => {
      // Here you would typically fetch new data from an API
      // For this example, we simulate data refresh by randomizing some values
      // const updatedData = data.map(machine => {
      //   const productionTime = Math.floor(Math.random() * 60) + 30; // Random production time between 30 and 90
      //   const actualTime = Math.floor(Math.random() * productionTime)+30; // Actual time less than or equal to production time
      //   const downtime = Math.floor(Math.random() * productionTime);
      //   const goodQualityCount = Math.floor(Math.random() * (actualTime * 5)); // Good quality count based on production
      //   const badQualityCount = Math.floor(Math.random() * (actualTime * 2)); // Bad quality count based on production
      //   return {
      //     ...machine,
      //     oee: parseFloat((Math.random() * 100).toFixed(1)), // Random OEE
      //     availability: parseInt((Math.random() * 100).toFixed(0)), // Random availability
      //     performance: parseInt((Math.random() * 100).toFixed(0)), // Random performance
      //     quality: parseInt((Math.random() * 100).toFixed(0)), // Random quality
      //     downtime: (actualTime-productionTime)> 0 , // Boolean for downtime
      //     itemDetails: {
      //       item: `Item ${String.fromCharCode(76 + Math.floor(Math.random() * 10))}`, // Random item L to O
      //       actual: goodQualityCount + badQualityCount,
      //       plan: Math.floor(Math.random() * (goodQualityCount + badQualityCount + 10)), // Random plan
      //       rejection: badQualityCount,
      //       productionTime: productionTime, // Dynamic production time
      //       actualTime: actualTime, // Dynamic actual time
      //       downtime: downtime, // Calculated downtime
      //       goodQualityCount: goodQualityCount, // Dynamic good quality count
      //       badQualityCount: badQualityCount, // Dynamic bad quality count
      //     },
      //   };
      // });
      // setData(updatedData);
      // console.log("Live Oee Data: ", liveOeeData)
      // if(liveOeeData.length>0){
      //   setData(liveOeeData);
      // }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [liveOeeData]);

  useEffect(() => {
    const checkZoom = () => {
      setIsZoomed(window.devicePixelRatio > 1.5);
    };
    window.addEventListener("resize", checkZoom);
    checkZoom(); // Check initial state
    return () => window.removeEventListener("resize", checkZoom);
  }, []);
  const handleTileClick = (item: any) => {
    setSelectedItem(item); // Store the selected item
    setCurrentItem([item])
  };
  const handleTileBack = (item: any) => {
    setSelectedItem(null); // Store the selected item
    setCurrentItem([])
  };
  const data1 = liveOeeData.oee||80;
  const data2 = 60;
  const data3 = 40;
  const data4 = 90;
  // console.log("Live Oee Data: ", data1)
  // Calculate total number of items and pages
  const totalItems = liveOeeData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Calculate the start and end index for slicing the data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // const currentItems = initialData
  //   .slice(startIndex, startIndex + ITEMS_PER_PAGE)
  //   .map((item) => ({
  //     ...item,
  //     oee: Number(item.oee.toFixed(2)),
  //     availability: Number(item.availability.toFixed(2)),
  //     performance: Number(item.performance.toFixed(2)),
  //   }));
  // console.log("Current Items: ", currentItems);
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  //Pagination Logic//
  return (
    <Content ref={contentRef} style={{ padding: "0 0px", marginTop: "20px" }}>
      <div className="site-layout-content">
        <Row
          gutter={[16, 16]}
          justify="center"
          style={{
            marginBottom: "20px",
            backgroundColor:"white",
            borderRadius: "10px",
            padding: "10px",
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Col span={isZoomed ? 10 : 6}>
            <GaugeChart
              value={data1}
              type={"OEE"}
            />
          </Col>
          <Col span={isZoomed ? 10 : 6}>
            <GaugeChart value={data2} type={"Availability"} />
          </Col>
          <Col span={isZoomed ? 10 : 6}>
            <GaugeChart value={data3} type={"Performance "} />
          </Col>
          <Col span={isZoomed ? 10 : 6}>
            <GaugeChart value={data4} type={"Quality "} />
          </Col>
        </Row>
        <div className={styles.tileWrapper}>
        {isSetShow && (
  <Row ref={contentRef} gutter={16} justify="start" align="middle" style={{ width: '100%' }}>
    <Col span={12} style={{ textAlign: 'left' }}>
      {selectedItem !== null && (
        <Button onClick={handleTileBack} icon={<ArrowLeftOutlined />} />
      )}
    </Col>
  </Row>
)}
        {currentItem.map((item, index) => ( <Box  key={index} onClick={() => handleTileClick(item)}>
          
        {isSetShow && ( <TileOee item={item}  />)}
           
        </Box>))}
      
        {selectedItem && (
  <>

    <LiveOeeWorkcenter setisSetShow={setisSetShow} ref={liveOeeRef} />
  </>
)}
        </div>
        {totalItems > ITEMS_PER_PAGE && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
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
export default LiveOeeSite;
