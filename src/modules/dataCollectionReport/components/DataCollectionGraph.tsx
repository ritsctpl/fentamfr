import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataCollectionGraphProps {
  data: any[];
}

const dummyData = [
    { parameterBo: 'Temperature', actualValue: '25.5', dcGroupBO: 'Environmental' },
    { parameterBo: 'Humidity', actualValue: '65.2', dcGroupBO: 'Environmental' },
    { parameterBo: 'Pressure', actualValue: '1013.2', dcGroupBO: 'Environmental' },
  ];

const DataCollectionGraph: React.FC<DataCollectionGraphProps> = ({ data }) => {
  // Transform data for the graph
  const transformedData = data?.map(item => ({
    name: item?.parameterBo,
    value: parseFloat(item?.actualValue) || 0,
    dcGroup: item?.dcGroupBO
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={transformedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name="Value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Example dummy data array:


export default DataCollectionGraph;
