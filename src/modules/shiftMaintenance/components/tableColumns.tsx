// import { CalendarRule, ColumnsType } from "../types/shiftTypes";
// import { Button,Popconfirm } from 'antd';

// const calendarRuleColumns: ColumnsType<CalendarRule> = [
//     { title: 'Day', dataIndex: 'day', key: 'day' },
//     { title: 'Production Day', dataIndex: 'prodDay', key: 'prodDay' },
//     { title: 'Day Class', dataIndex: 'dayClass', key: 'dayClass' },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (text: any, record: CalendarRule) => (
//         <>
//           <Button type="link" onClick={() => handleEditCalendarRule(record)}>
//             Edit
//           </Button>
//           <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteCalendarRule(record.day)}>
//             <Button type="link" danger>
//               Delete
//             </Button>
//           </Popconfirm>
//         </>
//       ),
//     },
//   ];