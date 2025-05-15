import React, { useState, useEffect, useContext } from 'react';
import { Table, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { ShiftContext } from '../hooks/shiftContext';

interface CalendarRule {
  day: string;
  productionDay: string;
  dayClass: string;
}

interface CalendarTableProps {
  currentFormData: any;
  setCurrentFormData: any;
}

const CalendarTable: React.FC<CalendarTableProps> = ({currentFormData, setCurrentFormData}) => {
  const { formData,setValueChange} = useContext(ShiftContext);
  const { t } = useTranslation();

  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [calendarRules, setcalenderRules] = useState<CalendarRule[]>(() => {
    const defaultRules = orderedDays.map(day => ({
      day,
      productionDay: 'Production',
      dayClass: 'NORMAL'
    }));

    if (currentFormData.calendarRules) {
      return orderedDays.map(day => 
        currentFormData.calendarRules.find((rule: CalendarRule) => rule.day === day) || 
        defaultRules.find(rule => rule.day === day)!
      );
    }

    return defaultRules;
  });
  useEffect(() => {
    const defaultRules = orderedDays.map(day => ({
      day,
      productionDay: 'Production',
      dayClass: 'NORMAL',
    }));

    const calendarRules = currentFormData.calendarRules || []; // Ensure it's an array

    const updatedRules = orderedDays.map(day => {
      const foundRule = calendarRules.find((rule: CalendarRule) => rule.day === day);
      return foundRule || defaultRules.find(rule => rule.day === day) || 
             { day, productionDay: 'Production', dayClass: 'NORMAL' }; // Fallback
    });

    setcalenderRules(updatedRules);
  }, [formData,setCurrentFormData]);

  const productionDayOptions = ['Production', 'Nonproduction'];
  const dayClassOptions = ['HOLIDAY', 'NORMAL', 'WEEKEND'];

  const columns: ColumnsType<CalendarRule> = [
    {
      title: t('Day'),
      dataIndex: 'day',
      ellipsis:true,
      key: 'day',
    },
    {
      title: t('Production Day'),
      dataIndex: 'productionDay',
      ellipsis:true,
      key: 'productionDay',
      render: (_, record) => (
        <Select
          value={record.productionDay}
          onChange={(value) => handleTableChange(record.day, 'productionDay', value)}
          style={{ width: '100%' }}
        >
          {productionDayOptions.map(option => (
            <Select.Option key={option} value={option}>{t(option)}</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: t('Day Class'),
      dataIndex: 'dayClass',
      ellipsis:true,
      key: 'dayClass',
      render: (_, record) => (
        <Select
          value={record.dayClass}
          onChange={(value) => handleTableChange(record.day, 'dayClass', value)}
          style={{ width: '100%' }}
        >
          {dayClassOptions.map(option => (
            <Select.Option key={option} value={option}>{t(option)}</Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  const handleTableChange = (day: string, field: 'productionDay' | 'dayClass', value: string) => {
    setValueChange(true);
    setcalenderRules(prevData => {
      const newRules = prevData.map(item =>
        item.day === day ? { ...item, [field]: value } : item
      );
      setCurrentFormData(prev => ({
        ...prev,
        calendarRules: newRules
      }));
      return newRules;
    });
  };

  useEffect(() => {
    setCurrentFormData(prevcurrentFormData => ({
      ...prevcurrentFormData,
      calendarRules: calendarRules
    }));
  }, [calendarRules, setCurrentFormData]);
console.log(formData.calendarRules,"formDatal");

  return (
    <div>
      <Table columns={columns} dataSource={calendarRules} pagination={false} rowKey="day" size="small" />
    </div>
  );
};

export default CalendarTable;