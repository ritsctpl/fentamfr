import {
  Card,
  List,
  Segmented,
  Splitter,
  ColorPicker,
  Empty,
  Slider,
  Button,
  message,
} from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useConfigContext } from "./hooks/configData";
import LineCharts from "./Charts/LineCharts";
import Barcharts from "./Charts/Barcharts";
import PieCharts from "./Charts/PieCharts";
import StackCharts from "./Charts/StackCharts";
import ParetoCharts from "./Charts/ParetoCharts";
import GaugeCharts from "./Charts/GaugeCharts";
import AreaCharts from "./Charts/AreaCharts";
import HeatMapCharts from "./Charts/HeatMapCharts";
import { getSampleData } from "@services/oeeServices";
import { DeleteOutlined } from "@ant-design/icons";
import { parseCookies } from 'nookies';
import TestGauge from "./Charts/TestGauge";
const site = parseCookies()?.site;

function ColorsSetting() {
  //state
  const { value, getCategories, setValue, updateData } = useConfigContext();
  const categories = useMemo(() => getCategories(), [getCategories]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
  const [listData, setListData] = useState([]);
  const [chartData, setChartData] = useState<{ [key: string]: any }>({});
  const [activeState, setActiveState] = useState<any>({});
  const [currentChartName, setCurrentChartName] = useState<string>("");

  useEffect(() => {
    function categoryData() {
      const categoryData =
        value[0]?.dashBoardDataList.find((cat) => cat.category === activeCategory)?.data ||
        [];
      return categoryData;
    }
    const data = categoryData();
    setListData(
      data.map((data, index) => ({
        id: index,
        name: data.dataName,
        type: data.type,
        endPoint: data.endPoint,
        colorScheme: data.colorScheme,
      }))
    );
  }, [activeCategory, categories, value]);

  const fetchChartData = async (listData: any) => {
    try {
      // Clear previous chart data first
      setChartData({});
      const data = await getSampleData(listData.endPoint, { site: site });
      setCurrentChartName(listData.name);
      setChartData({
        [listData.name]: data,
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({});
      setCurrentChartName("");
    }
  };

  // Clear chart data when category changes
  useEffect(() => {
    setChartData({});
    setCurrentChartName("");
    setActiveState({});
  }, [activeCategory]);

  const renderChart = useCallback(
    (dataItem: any) => {
      // Only render if this is the current chart
      if (dataItem.name !== currentChartName) {
        return null;
      }

      const data = chartData[dataItem.name] || [];
      switch (dataItem.type) {
        case "line":
          return <LineCharts data={data} colorSchema={dataItem?.colorScheme} per={'%'} />;
        case "bar":
          return <Barcharts data={data} colorSchema={dataItem?.colorScheme} per={'%'} />;
        case "pie":
          return <PieCharts data={data} per={'%'}/>;
        case "stack":
          return <StackCharts data={data} colorSchema={dataItem?.colorScheme} per={'%'} />;
        case "pareto":
          return <ParetoCharts data={data} colorSchema={dataItem?.colorScheme} per={'%'}/>;
        case "gauge":
          return <TestGauge data={data} colorSchema={dataItem?.colorScheme}  />;
        case "speedGauge":
          return <GaugeCharts data={data} />;
        case "area":
          return <AreaCharts data={data} colorSchema={dataItem?.colorScheme} per={'%'}/>;
        case "heatmap":
          return <HeatMapCharts data={data} />;
        default:
          return null;
      }
    },
    [chartData, currentChartName]
  );

  const handleSave = () => {
    try {
      updateData(value[0]);
      message.success('Colors saved successfully');
    } catch (error) {
      message.error('Failed to save colors');
    }
  };

  const handleColorChange = (
    color: any,
    styleId: number,
    type: "line" | "item"
  ) => {
    const newValue = [...value];
    const categoryIndex = newValue.findIndex((v) =>
      v.dashBoardDataList.some((cat) => cat.category === activeCategory)
    );
    if (categoryIndex === -1) return;

    const vDataIndex = newValue[categoryIndex].dashBoardDataList.findIndex(
      (cat) => cat.category === activeCategory
    );
    if (vDataIndex === -1) return;

    const dataIndex = newValue[categoryIndex].dashBoardDataList[vDataIndex].data.findIndex(
      (d) => d.dataName === activeState.name
    );
    if (dataIndex === -1) return;

    const currentData =
      newValue[categoryIndex].dashBoardDataList[vDataIndex].data[dataIndex];

    // Initialize colorScheme if it doesn't exist
    if (!currentData.colorScheme) {
      currentData.colorScheme = {
        lineColor: [],
        itemColor: [],
      };
    }
    if (type === "line") {
      if (!currentData.colorScheme.lineColor) {
        currentData.colorScheme.lineColor = [];
      }
      currentData.colorScheme.lineColor[styleId] = color.toHexString();
    } else {
      if (!currentData.colorScheme.itemColor) {
        currentData.colorScheme.itemColor = [];
      }
      currentData.colorScheme.itemColor[styleId].color = color.toHexString();
    }

    setValue(newValue);
    setActiveState({
      ...activeState,
      colorScheme: currentData.colorScheme,
    });
  };

  const handleRangeChange = (range: number, styleId: number) => {
    const newValue = [...value];
    const categoryIndex = newValue.findIndex((v) =>
      v.dashBoardDataList.some((cat) => cat.category === activeCategory)
    );
    if (categoryIndex === -1) return;

    const vDataIndex = newValue[categoryIndex].dashBoardDataList.findIndex(
      (cat) => cat.category === activeCategory
    );
    if (vDataIndex === -1) return;

    const dataIndex = newValue[categoryIndex].dashBoardDataList[vDataIndex].data.findIndex(
      (d) => d.dataName === activeState.name
    );
    if (dataIndex === -1) return;

    const currentData =
      newValue[categoryIndex].dashBoardDataList[vDataIndex].data[dataIndex];

    // Initialize colorScheme if it doesn't exist
    if (!currentData.colorScheme) {
      currentData.colorScheme = {
        lineColor: [],
        itemColor: [],
      };
    }
    if (!currentData.colorScheme.itemColor) {
      currentData.colorScheme.itemColor = [];
    }

    currentData.colorScheme.itemColor[styleId].range = range;

    setValue(newValue);
    setActiveState({
      ...activeState,
      colorScheme: currentData.colorScheme,
    });
  };

  const handleAddLineColor = () => {
    const newValue = [...value];
    const categoryIndex = newValue.findIndex((v) =>
      v.dashBoardDataList.some((cat) => cat.category === activeCategory)
    );
    if (categoryIndex === -1) return;

    const vDataIndex = newValue[categoryIndex].dashBoardDataList.findIndex(
      (cat) => cat.category === activeCategory
    );
    if (vDataIndex === -1) return;

    const dataIndex = newValue[categoryIndex].dashBoardDataList[vDataIndex].data.findIndex(
      (d) => d.dataName === activeState.name
    );
    if (dataIndex === -1) return;

    const currentData =
      newValue[categoryIndex].dashBoardDataList[vDataIndex].data[dataIndex];

    // Initialize colorScheme if it doesn't exist
    if (!currentData.colorScheme) {
      currentData.colorScheme = {
        lineColor: [],
        itemColor: [],
      };
    }
    if (!currentData.colorScheme.lineColor) {
      currentData.colorScheme.lineColor = [];
    }

    // Add new line color with default color
    currentData.colorScheme.lineColor.push("#1890FF");

    setValue(newValue);
    setActiveState({
      ...activeState,
      colorScheme: currentData.colorScheme,
    });
  };

  const handleAddItemColor = () => {
    const newValue = [...value];
    const categoryIndex = newValue.findIndex((v) =>
      v.dashBoardDataList.some((cat) => cat.category === activeCategory)
    );
    if (categoryIndex === -1) return;

    const vDataIndex = newValue[categoryIndex].dashBoardDataList.findIndex(
      (cat) => cat.category === activeCategory
    );
    if (vDataIndex === -1) return;

    const dataIndex = newValue[categoryIndex].dashBoardDataList[vDataIndex].data.findIndex(
      (d) => d.dataName === activeState.name
    );
    if (dataIndex === -1) return;

    const currentData =
      newValue[categoryIndex].dashBoardDataList[vDataIndex].data[dataIndex];

    // Initialize colorScheme if it doesn't exist
    if (!currentData.colorScheme) {
      currentData.colorScheme = {
        lineColor: [],
        itemColor: [],
      };
    }
    if (!currentData.colorScheme.itemColor) {
      currentData.colorScheme.itemColor = [];
    }

    // Add new item color with default values
    currentData.colorScheme.itemColor.push({
      color: "#1890FF",
      range: 50,
    });

    setValue(newValue);
    setActiveState({
      ...activeState,
      colorScheme: currentData.colorScheme,
    });
  };

  const handleDeleteLineColor = (indexToDelete: number) => {
    const newValue = [...value];
    const categoryIndex = newValue.findIndex((v) =>
      v.dashBoardDataList.some((cat) => cat.category === activeCategory)
    );
    if (categoryIndex === -1) return;

    const vDataIndex = newValue[categoryIndex].dashBoardDataList.findIndex(
      (cat) => cat.category === activeCategory
    );
    if (vDataIndex === -1) return;

    const dataIndex = newValue[categoryIndex].dashBoardDataList[vDataIndex].data.findIndex(
      (d) => d.dataName === activeState.name
    );
    if (dataIndex === -1) return;

    const currentData =
      newValue[categoryIndex].dashBoardDataList[vDataIndex].data[dataIndex];

    currentData.colorScheme.lineColor =
      currentData.colorScheme.lineColor.filter(
        (_, index) => index !== indexToDelete
      );

    setValue(newValue);
    setActiveState({
      ...activeState,
      colorScheme: currentData.colorScheme,
    });
  };

  const handleDeleteItemColor = (indexToDelete: number) => {
    const newValue = [...value];
    const categoryIndex = newValue.findIndex((v) =>
      v.dashBoardDataList.some((cat) => cat.category === activeCategory)
    );
    if (categoryIndex === -1) return;

    const vDataIndex = newValue[categoryIndex].dashBoardDataList.findIndex(
      (cat) => cat.category === activeCategory
    );
    if (vDataIndex === -1) return;

    const dataIndex = newValue[categoryIndex].dashBoardDataList[vDataIndex].data.findIndex(
      (d) => d.dataName === activeState.name
    );
    if (dataIndex === -1) return;

    const currentData =
      newValue[categoryIndex].dashBoardDataList[vDataIndex].data[dataIndex];

    currentData.colorScheme.itemColor =
      currentData.colorScheme.itemColor.filter(
        (_, index) => index !== indexToDelete
      );

    setValue(newValue);
    setActiveState({
      ...activeState,
      colorScheme: currentData.colorScheme,
    });
  };

  // Common row styles - add this at the top of your component
  const commonRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
    height: "40px", // Fixed height for consistency
  };

  // Modify the List.Item click handler
  const handleChartSelect = (item: any) => {
    // Clear previous state first
    setChartData({});
    setCurrentChartName("");

    // Create a fresh copy of the selected item
    const newActiveState = {
      ...item,
      colorScheme: item.colorScheme
        ? {
          lineColor: [...(item.colorScheme.lineColor || [])],
          itemColor: [...(item.colorScheme.itemColor || [])].map((color) => ({
            ...color,
          })),
        }
        : {
          lineColor: [],
          itemColor: [],
        },
    };

    setActiveState(newActiveState);
    fetchChartData(item);
  };

  return (
    <>
      <Splitter style={{ height: "100%", backgroundColor: "#fff" }}>
        <Splitter.Panel
          defaultSize="30%"
          min="20%"
          max="30%"
          style={{ padding: 10 }}
        >
          <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div style={{ padding: "8px 0" }}>
              <Segmented
                options={categories}
                value={activeCategory}
                size="middle"
                onChange={(value) => setActiveCategory(value.toString())}
                style={{
                  backgroundColor: "#1890ff" + 30,
                  padding: "4px",
                  width: 400,
                  borderRadius: "5px",
                  fontWeight: 600,
                  overflowX: "auto",
                }}
              />
            </div>
            <List
              style={{ flex: 1, overflow: "auto", cursor: "pointer" }}
              bordered
              dataSource={listData}
              renderItem={(item) =>
                item.type != "pie" &&
                item.type != "table" && item.type != "heatmap" && (
                  <List.Item
                    key={item.id}
                    onClick={() => handleChartSelect(item)}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {item.name}
                        </div>
                      }
                    />
                    <div
                      style={{
                        backgroundColor: "#f0f0f0",
                        padding: "4px 12px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        minWidth: "80px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        border: "1px solid #e8e8e8",
                      }}
                    >
                      {item.type.toUpperCase()}
                    </div>
                  </List.Item>
                )
              }
            />
          </div>
        </Splitter.Panel>
        <Splitter.Panel style={{ padding: "15px 0", height: "100%" }}>
          {Object.keys(activeState).length > 0 ? (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Card
                size="small"
                style={{
                  border: "none",
                  height: "60%",
                  maxWidth: "100%",
                }}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}
                    >
                      {activeState.name || "Chart Preview"}
                    </span>
                    <Button type="primary" size="small" onClick={handleSave}>
                      Save
                    </Button>
                  </div>
                }
              >
                <div style={{ height: "300px", width: "100%" }}>
                  {renderChart(activeState)}
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  height: "40%",
                }}
              >
                {(activeState.type === "line" ||
                  activeState.type === "area" ||
                  activeState.type === "pareto") && (
                    <Card
                      size="small"
                      style={{
                        width: "40%",
                        height: "100%",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      bodyStyle={{
                        padding: "12px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            position: "sticky",
                            top: 0,
                            backgroundColor: "#fff",
                            zIndex: 1,
                          }}
                        >
                          <span style={{ fontSize: "14px", fontWeight: 600 }}>
                            Line Style
                          </span>
                          <span
                            style={{
                              cursor: "pointer",
                              fontSize: "20px",
                              color: "#1890ff",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                            }}
                            onClick={handleAddLineColor}
                          >
                            +
                          </span>
                        </div>
                      }
                    >
                      {activeState?.colorScheme?.lineColor.length > 0 ? (
                        <div
                          style={{
                            overflowY: "auto",
                            height: "100%",
                            padding: "0 12px",
                          }}
                        >
                          {activeState?.colorScheme?.lineColor.map(
                            (style, index) => (
                              <div key={index} style={commonRowStyle}>
                                <span style={{ fontSize: "14px" }}>
                                  Line {index + 1}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <ColorPicker
                                    value={style}
                                    size="small"
                                    onChange={(color) =>
                                      handleColorChange(color, index, "line")
                                    }
                                    presets={[
                                      {
                                        label: "Recommended",
                                        colors: [
                                          "#000000",
                                          "#1890FF",
                                          "#52C41A",
                                          "#FAAD14",
                                          "#F5222D",
                                        ],
                                      },
                                    ]}
                                    showText
                                  />
                                  <DeleteOutlined
                                    style={{
                                      color: "#ff4d4f",
                                      cursor: "pointer",
                                      fontSize: "16px",
                                    }}
                                    onClick={() => handleDeleteLineColor(index)}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No line Styles"
                          />
                        </div>
                      )}
                    </Card>
                  )}
                <Card
                  size="small"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  bodyStyle={{
                    padding: "12px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        zIndex: 1,
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>
                        Item Style
                      </span>
                      <span
                        style={{
                          cursor: "pointer",
                          fontSize: "20px",
                          color: "#1890ff",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                        }}
                        onClick={handleAddItemColor}
                      >
                        +
                      </span>
                    </div>
                  }
                >
                  {activeState?.colorScheme?.itemColor.length > 0 ? (
                    <div
                      style={{
                        overflowY: "auto",
                        height: "100%",
                        padding: "0 12px",
                        flex: 1,
                      }}
                    >
                      {activeState?.colorScheme?.itemColor.map(
                        (style, index) => (
                          <div key={index} style={commonRowStyle}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <ColorPicker
                                value={style.color}
                                size="small"
                                onChange={(color) =>
                                  handleColorChange(color, index, "item")
                                }
                                presets={[
                                  {
                                    label: "Recommended",
                                    colors: [
                                      "#000000",
                                      "#1890FF",
                                      "#52C41A",
                                      "#FAAD14",
                                      "#F5222D",
                                    ],
                                  },
                                ]}
                                showText
                              />
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flex: 1,
                                marginLeft: 16,
                              }}
                            >
                              <Slider
                                value={style.range}
                                min={0}
                                max={100}
                                onChange={(value) =>
                                  handleRangeChange(value, index)
                                }
                                style={{ flex: 1 }}
                                trackStyle={{ backgroundColor: style.color }}
                                handleStyle={{
                                  backgroundColor: style.color,
                                  borderColor: style.color,
                                }}
                              />
                              <span
                                style={{ minWidth: "40px", fontSize: "12px" }}
                              >
                                {Math.round(style.range)}%
                              </span>
                              <DeleteOutlined
                                style={{
                                  color: "#ff4d4f",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                                onClick={() => handleDeleteItemColor(index)}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No items Styles"
                      />
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No chart selected"
              />
            </div>
          )}
        </Splitter.Panel>
      </Splitter>
    </>
  );
}

export default ColorsSetting;
