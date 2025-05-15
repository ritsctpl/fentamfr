import React, { useState, useRef } from 'react';
import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox'; // Import the type from antd
import styles from './AccordionCheckbox.module.css';
import { DownOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';

const CheckboxGroup = Checkbox.Group;

interface Workcenter {
  name: string;
  workcenter: string[];
}

interface AccordionProps {
  lable: string;
  data: Workcenter[];
}

const AccordionCheckBox: React.FC<AccordionProps> = ({ lable, data }) => {
  const [checkedLists, setCheckedLists] = useState<Record<number, string[]>>({});
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const { overallfilter, setFilter } = useFilterContext();
  const handleCheckAllChange = (e: CheckboxChangeEvent, index: number) => {
    const isChecked = e.target.checked;
    const options = data[index].workcenter;
    setCheckedLists(prev => ({
      ...prev,
      [index]: isChecked ? options : []
    }));
  };

  const handleCheckboxChange = (list: string[], index: number) => {
    setCheckedLists(prev => ({
      ...prev,
      [index]: list
    }));
    setFilter({...overallfilter,[lable]:list})
  };

  const toggleExpand = (index: number) => {
    setExpandedIndices(prev => {
      const newExpandedIndices = new Set(prev);
      if (newExpandedIndices.has(index)) {
        newExpandedIndices.delete(index);
      } else {
        newExpandedIndices.add(index);
      }
      return newExpandedIndices;
    });
  };

  return (
    <div ref={containerRef}>
      {data.map((item, index) => {
        const checkedList = checkedLists[index] || [];
        const checkAll = item.workcenter.length === checkedList.length;
        const indeterminate = checkedList.length > 0 && checkedList.length < item.workcenter.length;

        return (
          <div key={index} className={styles.datePicker}>
            <a className={styles.heading} >{item.name}</a>

            <div className={styles.sheet} onClick={() => toggleExpand(index)}>
              <a>{item.name}</a>
              <div className={styles.expand}>
                <Checkbox
                  indeterminate={indeterminate}
                  onChange={e => handleCheckAllChange(e as CheckboxChangeEvent, index)}
                  checked={checkAll}
                />
                <DownOutlined style={{ fontSize: '12px', fontWeight: 'bold' }} />
              </div>
            </div>
            <div
              className={`${styles.paper} ${expandedIndices.has(index) ? styles.paper_open : ''}`}
            >
              <CheckboxGroup
                options={item.workcenter}
                value={checkedList}
                onChange={list => handleCheckboxChange(list as string[], index)}
                style={{ display: 'grid', margin: '12px' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccordionCheckBox;
