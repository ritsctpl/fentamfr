// components/Toolbar.tsx
import { Button } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import '../UniversalForm.css';

interface ToolbarProps {
  onAdd: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAdd }) => {
  return (
    <div className='toolbar-container'>
      <Button icon={<PlusOutlined />} onClick={onAdd}>Add Field</Button>
    </div>
  );
};

export default Toolbar;
