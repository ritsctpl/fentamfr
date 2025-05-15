import { Col, Progress } from 'antd';
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';



const OverallOee: React.FC = (overallOee:any) => {
  const getColorByPercentage = (value: number) => {
    if (value >= 85) return "#52c41a"; // Green for good
    if (value >= 60) return "#faad14"; // Yellow for warning
    return "#f5222d"; // Red for poor
  };

  return (

       
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "#fff",
        padding: "8px 16px",
        borderRadius: "6px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        marginRight: "12px",
        minWidth: "340px",
      }}
    >
      <div style={{ fontWeight: "500", fontSize: "13px", color: "#666" }}>
        Overall OEE
      </div>
      <div style={{ flex: 1 }}>
        <Progress
          percent={Number(overallOee.toFixed(1))}
          size="small"
          strokeColor={{
            "0%": getColorByPercentage(overallOee),
            "100%": getColorByPercentage(overallOee),
          }}
          format={(percent) => `${percent}%`}
        />
      </div>
    </div>
  

  );
};


export default OverallOee;

