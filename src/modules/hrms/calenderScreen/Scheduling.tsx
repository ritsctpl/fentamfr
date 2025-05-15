import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import dayjs from 'dayjs';
import { Modal, Form, Input, DatePicker, Select, Button, Tag, Tooltip, message } from 'antd';
import { 
  CalendarOutlined, 
  PlusOutlined, 
  FilterOutlined, 
  DeleteOutlined, 
  SaveOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';

// Styles
import styles from "./style/Scheduling.module.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// Types
interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type?: string;
  location?: string;
}

interface EventType {
  value: string;
  label: string;
  color: string;
}

// Constants
const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);
const { Option } = Select;

const EVENT_TYPES: EventType[] = [
  { value: 'leave', label: 'Leave Request', color: '#1890ff' },
  { value: 'meeting', label: 'Meeting', color: '#52c41a' },
  { value: 'training', label: 'Training', color: '#722ed1' },
  { value: 'holiday', label: 'Holiday', color: '#fa8c16' },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 0,
    title: 'Board meeting',
    start: new Date(2024, 10, 10, 10, 0),
    end: new Date(2024, 10, 10, 12, 0),
    description: 'Quarterly board meeting with stakeholders',
    location: 'Conference Room A',
    type: 'meeting'
  },
  {
    id: 1,
    title: 'Conference',
    start: new Date(2024, 10, 12, 14, 0),
    end: new Date(2024, 10, 12, 15, 0),
    type: 'meeting'
  },
];

// Component for agenda event display
const AgendaEvent = React.memo(({ event }: { event: Event }) => {
  const eventType = EVENT_TYPES.find(t => t.value === event.type);
  
  const handleQuickDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Use a custom event to communicate with parent
    window.dispatchEvent(new CustomEvent('deleteEvent', { detail: event.id }));
  }, [event.id]);

  return (
    <div className={styles.agendaEvent}>
      <Tag color={eventType?.color} className={styles.agendaTag}>
        {eventType?.label || 'Other'}
      </Tag>
      <div className={styles.agendaContent}>
        <span className={styles.agendaTitle}>{event.title}</span>
        <div className={styles.agendaActions}>
          {event.description && (
            <Tooltip title={event.description}>
              <InfoCircleOutlined className={styles.infoIcon} />
            </Tooltip>
          )}
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className={styles.deleteButton}
            onClick={handleQuickDelete}
            danger
          />
        </div>
      </div>
    </div>
  );
});

// Add display name
AgendaEvent.displayName = 'AgendaEvent';

// Add this new component for month/week/day event display
const EventDisplay = React.memo(({ event }: { event: Event }) => {
  const eventType = EVENT_TYPES.find(t => t.value === event.type);
  
  return (
    <div 
      className={styles.eventDisplay}
      // style={{ backgroundColor: eventType?.color + '20' ,color:"black",border:`1px solid ${eventType?.color}`}} // Light version of the color
    >
      <Tag color={eventType?.color} className={styles.eventTag}>
        {eventType?.label || 'Other'}
      </Tag>
      <span className={styles.eventTitle}>{event.title}</span>
    </div>
  );
});

EventDisplay.displayName = 'EventDisplay';

const Scheduling = () => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [form] = Form.useForm();

  // Memoized calendar components
  const components = useMemo(() => ({
    agenda: {
      event: AgendaEvent
    },
    event: EventDisplay, // Add this line to use custom event display for month/week/day views
  }), []);

  // Event Handlers
  const handleEventDoubleClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    form.setFieldsValue({
      title: event.title,
      description: event.description,
      dateRange: [dayjs(event.start), dayjs(event.end)],
      type: event.type
    });
    setModalVisible(true);
  }, [form]);

  const handleSelectSlot = useCallback(({ start, end, action }: any) => {
    if (action === 'click') {
      // Set default time to 9 AM - 10 AM for the selected date
      const defaultStart = dayjs(start).hour(9).minute(0);
      const defaultEnd = dayjs(start).hour(10).minute(0);

      setSelectedEvent(null);
      form.setFieldsValue({
        dateRange: [defaultStart, defaultEnd]
      });
      setModalVisible(true);
    }
  }, [form]);

  const onEventDrop = useCallback(({ event, start, end, allDay }: any) => {
    setEvents(prev => {
      const existing = prev.find(ev => ev.id === event.id) ?? {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end
      };
      const filtered = prev.filter(ev => ev.id !== event.id);
      const updatedEvent = { ...existing, start, end, allDay };

      message.success('Event moved successfully');
      return [...filtered, updatedEvent];
    });
  }, []);

  const onEventResize = useCallback(({ event, start, end }: any) => {
    setEvents(prev => {
      const existing = prev.find(ev => ev.id === event.id) ?? {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end
      };
      const filtered = prev.filter(ev => ev.id !== event.id);
      const updatedEvent = { ...existing, start, end };
      
      message.success('Event duration updated');
      return [...filtered, updatedEvent];
    });
  }, []);

  const handleModalSubmit = useCallback(() => {
    form.validateFields().then(values => {
      const [start, end] = values.dateRange;
      const eventData = {
        id: selectedEvent?.id ?? Math.random(),
        title: values.title,
        description: values.description,
        type: values.type,
        start: start.toDate(),
        end: end.toDate()
      };

      setEvents(prev => {
        if (selectedEvent) {
          return prev.map(e => e.id === selectedEvent.id ? eventData : e);
        }
        return [...prev, eventData];
      });

      message.success(`Event ${selectedEvent ? 'updated' : 'created'} successfully`);
      setModalVisible(false);
      setSelectedEvent(null);
      form.resetFields();
    });
  }, [form, selectedEvent]);

  const handleDelete = useCallback(() => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      message.success('Event deleted successfully');
      setModalVisible(false);
      setSelectedEvent(null);
      form.resetFields();
    }
  }, [selectedEvent, form]);

  // Effect for handling quick delete from AgendaEvent
  React.useEffect(() => {
    const handleQuickDelete = (e: CustomEvent) => {
      setEvents(prev => prev.filter(evt => evt.id !== e.detail));
      message.success('Event deleted successfully');
    };

    window.addEventListener('deleteEvent', handleQuickDelete as EventListener);
    return () => window.removeEventListener('deleteEvent', handleQuickDelete as EventListener);
  }, []);

  return (
    <div className={styles.calendarContainer}>
      {/* Calendar Header */}
      <div className={styles.calendarHeader}>
        <div className={styles.calendarTitle}>
          <CalendarOutlined style={{ marginRight: 12 }} />
          Employee Schedule Calendar
        </div>
        <div className={styles.calendarActions}>
          <Select
            mode="multiple"
            placeholder="Filter by event type"
            style={{ width: 200 }}
            suffixIcon={<FilterOutlined />}
          >
            {EVENT_TYPES.map(type => (
              <Option key={type.value} value={type.value}>
                <Tag color={type.color}>{type.label}</Tag>
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setModalVisible(true)}
          >
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className={styles.calendarWrapper}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          selectable
          onDoubleClickEvent={handleEventDoubleClick}
          onSelectSlot={handleSelectSlot}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          draggableAccessor={() => true}
          min={new Date(2024, 0, 1, 9, 0, 0)}
          max={new Date(2024, 0, 1, 21, 0, 0)}
          className={styles.calendar}
          eventPropGetter={(event) => ({
            style: { backgroundColor: event.type ? EVENT_TYPES.find(t => t.value === event.type)?.color+30 : '#cbcbcb'+30 }
          })}
          views={['month', 'week', 'day', 'agenda']}
          components={components}
          resizable
        />
      </div>

      {/* Event Modal */}
      <Modal
        title={selectedEvent ? 'Edit Event' : 'Create Event'}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => {
          setModalVisible(false);
          setSelectedEvent(null);
          form.resetFields();
        }}
        className={styles.eventModal}
        width={600}
        footer={[
          selectedEvent && (
            <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete Event
            </Button>
          ),
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" icon={<SaveOutlined />} onClick={handleModalSubmit}>
            {selectedEvent ? 'Update Event' : 'Create Event'}
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="type"
            label="Event Type"
            rules={[{ required: true }]}
          >
            <Select>
              {EVENT_TYPES.map(type => (
                <Option key={type.value} value={type.value}>
                  <Tag color={type.color}>{type.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date & Time"
            rules={[{ required: true }]}
          >
            <DatePicker.RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              minuteStep={5}
              use12Hours
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Scheduling;