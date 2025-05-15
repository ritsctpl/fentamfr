import React, { useContext, useState, useEffect } from 'react';
import { Table, Space, message, Select, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'antd';
import type { Dayjs } from 'dayjs';
import { SelectInfo } from 'antd/es/calendar/generateCalendar';
import { ShiftContext } from '../hooks/shiftContext';

interface CalendarOverride {
  date: string;
  productionDay: string;
  dayClass: string;
}

interface CalendarRule {
  day: string;
  productionDay: string;
  dayClass: string;
}

interface CalendarTableProps {
  currentFormData: any;
  setCurrentFormData: any;
}

const CalendarTab: React.FC<CalendarTableProps> = ({currentFormData, setCurrentFormData}) => {
  const { setValueChange } = useContext(ShiftContext);
  const { t } = useTranslation();

  const [calendarOverrides, setCalendarOverrides] = useState<CalendarOverride[]>(
    currentFormData.calendarOverrides || []
  );
  const [calendarRules, setCalendarRules] = useState<CalendarRule[]>(
    currentFormData.calendarRules || []
  );
// Resetting state when currentFormData changes
useEffect(() => {
  setCalendarOverrides(currentFormData.calendarOverrides || []);
  setCalendarRules(currentFormData.calendarRules || []);
}, [currentFormData]);


  const productionDayOptions = ['Production', 'Nonproduction'];
  const dayClassOptions = ['HOLIDAY', 'NORMAL', 'WEEKEND'];
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayClass, setSelectedDayClass] = useState('');
  const [selectedProductionDay, setSelectedProductionDay] = useState('');


  const dateCellRender = (value: Dayjs) => {
    const dateString = value.format('YYYY-MM-DD');
    const dayOfWeek = value.format('dddd');
    
    // Modified to handle ISO date string from API
    const override = calendarOverrides.find(item => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      return itemDate === dateString;
    });
    
    const rule = calendarRules.find(item => item.day === dayOfWeek);
    const dayData = override || rule || { productionDay: 'Production', dayClass: 'NORMAL' };
    
    return (
      <div>
        <div>{dayData.productionDay}</div>
        <div>{dayData.dayClass}</div>
      </div>
    );
  };

  const handleDateClick = (value: Dayjs) => {
    setValueChange(true);
    const dateString = value.format('YYYY-MM-DD');
    const dayOfWeek = value.format('dddd');
    const override = calendarOverrides.find(item => item.date === dateString);
    const rule = calendarRules.find(item => item.day === dayOfWeek);
    const dayData = override ||rule|| { productionDay: 'Production', dayClass: 'NORMAL' };
    setSelectedDate(value);
    setSelectedDayClass(dayData.dayClass);
    setSelectedProductionDay(dayData.productionDay);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleModalSave = () => {
    setValueChange(true);
    if (selectedDate) {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const dayOfWeek = selectedDate.format('dddd');
      const rule = calendarRules.find(item => item.day === dayOfWeek);

      if (selectedProductionDay === rule?.productionDay && selectedDayClass === rule?.dayClass) {
        // If the values match the rule, remove any override
        setCalendarOverrides(prevOverrides => 
          prevOverrides.filter(item => item.date !== dateString)
        );
      } else {
        // Otherwise, add or update the override
        setCalendarOverrides(prevOverrides => {
          const index = prevOverrides.findIndex(item => item.date === dateString);
          if (index !== -1) {
            return prevOverrides.map(item => 
              item.date === dateString ? { date: dateString, productionDay: selectedProductionDay, dayClass: selectedDayClass } : item
            );
          } else {
            return [...prevOverrides, { date: dateString, productionDay: selectedProductionDay, dayClass: selectedDayClass }];
          }
        });
      }
      setIsModalVisible(false);
      // message.success(`Updated ${dateString}'s settings`);
    }
  };

  useEffect(() => {
    setCurrentFormData(prevCurrentFormData => ({
      ...prevCurrentFormData,
      calendarOverrides: calendarOverrides,
      calendarRules: calendarRules
    }));
  }, [calendarOverrides, calendarRules, setCurrentFormData]);

  return (
    <div>
      <Calendar 
        onSelect={(date: Dayjs, selectInfo: SelectInfo) => {
          if(selectInfo.source!='year'&&selectInfo.source!='month'){
            handleDateClick(date)
          }
        }}
        cellRender={dateCellRender}
      />
      <Modal
        title={`Edit ${selectedDate?.format('YYYY-MM-DD')}`}
        visible={isModalVisible}
        onCancel={handleModalClose}
        onOk={handleModalSave}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>Day Class:</label>
            <Select
              value={selectedDayClass}
              onChange={setSelectedDayClass}
              style={{ width: '100%' }}
            >
              {dayClassOptions.map(option => (
                <Select.Option key={option} value={option}>{t(option)}</Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label>Production Day:</label>
            <Select
              value={selectedProductionDay}
              onChange={setSelectedProductionDay}
              style={{ width: '100%' }}
            >
              {productionDayOptions.map(option => (
                <Select.Option key={option} value={option}>{t(option)}</Select.Option>
              ))}
            </Select>
          </div>
        </Space>
      </Modal>
      </div>
  );
};

export default CalendarTab;