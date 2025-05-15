import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { Progress } from "antd";
 
 
 
 
const DownTimeCard: React.FC = (data) => {
  const { color, downtimeOeeData } = useFilterContext();
  console.log(downtimeOeeData,"downtimeOeeData");
 
  // const getColorByPercentage = (value: number) => {
  //   if (value >= 85) return "#52c41a"; // Green for good
  //   if (value >= 60) return "#faad14"; // Yellow for warning
  //   return "#f5222d"; // Red for poor
  // };
 
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };
 
  const totalDuration = downtimeOeeData?.getOverall?.find(item => item.name === "TotalDuration")?.duration || 0;
  const totalDowntime = downtimeOeeData?.getOverall?.find(item => item.name === "TotalDowntime")?.duration || 0;
 
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: "#fff",
        padding: "5px 10px",
        borderRadius: "6px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        marginRight: "12px",
        minWidth: "400px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ fontWeight: "500", fontSize: "13px", color: "#666", minWidth: "80px" }}>
          Total Duration
        </div>
        <div style={{ flex: 1 ,minWidth: "100px"}}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "red", letterSpacing: "0.3px", fontFamily: "'Roboto Mono', monospace" }}>{formatTime(totalDuration)}</span>
        </div>
        <div style={{ fontWeight: "500", fontSize: "13px", color: "#666", minWidth: "80px" }}>
          Total Downtime
        </div>
        <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "red", letterSpacing: "0.3px", fontFamily: "'Roboto Mono', monospace" }}>{formatTime(totalDowntime)}</span>
        </div>
         
         
        </div>
        </div>
    </div>
  );
};
 
 
export default DownTimeCard;