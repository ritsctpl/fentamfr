import { Form, Input, Select, Button, Row, Col, Modal, message } from 'antd';
import { FC, ChangeEvent, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { JoltSpecContext } from '../hooks/joltSpecContext';
import { decodeSpec } from '@services/joltSpecService';


const { TextArea } = Input;
const { Option } = Select;

interface SpecFormProps {
  onFinish: (values: any) => void;
  initialValues?: any;
  disabled?: any;
}

const SpecForm: FC<SpecFormProps> = ({ onFinish, initialValues }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { payloadData, setPayloadData, disabledFields, setDisabledFields, setShowAlert } = useContext<any>(JoltSpecContext);
  const [isJsonataModalOpen, setIsJsonataModalOpen] = useState<any>();

  useEffect(() => {
    form.setFieldsValue(payloadData);
  }, [payloadData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState<'XSLT' | 'JSONATA'>('XSLT');
  const [joltModal, setJoltModal] = useState<any>();
  const [jolt, setJolt] = useState<any>();

  const handleSpecNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = value
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '');

    form.setFieldValue('specName', formattedValue);
    setPayloadData({ ...payloadData, specName: formattedValue });
    setShowAlert(true);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldValue('description', value);
    setPayloadData({ ...payloadData, description: value });
    setShowAlert(true);
  };

  const handleTypeChange = (value: string) => {
    form.setFieldValue('type', value);
    setShowAlert(true);
    setPayloadData({ ...payloadData, type: value });

    // Clear all spec fields first
    const clearedFields = {
      joltSpec: '',
      xsltSpec: '',
      encodeXsltSpec: '',
      jsonataSpec: '',
      encodedJsonAtaSpec: ''
    };

    form.setFieldsValue(clearedFields);
    setPayloadData({ ...payloadData, ...clearedFields, type: value });

    // Set all fields as disabled
    const newDisabledState = {
      joltSpec: true,
      xsltSpec: true,
      encodeXsltSpec: true,
      jsonataSpec: true,
      encodedJsonAtaSpec: true
    };

    // Enable relevant fields based on type
    switch (value) {
      case 'JOLT':
        newDisabledState.joltSpec = false;
        break;
      case 'XSLT':
        newDisabledState.xsltSpec = false;
        newDisabledState.encodeXsltSpec = false;
        break;
      case 'JSONATA':
        newDisabledState.jsonataSpec = false;
        newDisabledState.encodedJsonAtaSpec = false;
        break;
    }

    setDisabledFields(newDisabledState);
  };

  const handleTextAreaChange = (field: string, value: any) => {
    debugger
    setShowAlert(true);
    setPayloadData({ ...payloadData, [field]: value });
  };

  const handleDecode = async (field: string) => {
    message.destroy();
    debugger
    if (field == "xsltSpec") {
      setIsJsonataModalOpen(false);
      setIsModalOpen(true);

    }
    else {
      setIsModalOpen(false);
      setIsJsonataModalOpen(true);
    }
    // let specValue;
    // if (field == 'encodeXsltSpec')
    //   specValue = form.getFieldsValue().xsltSpec;

    // else
    //   specValue = form.getFieldsValue().jsonataSpec;

    // const encodedValue = form.getFieldValue(field);
    // if (specValue == undefined || specValue == null || specValue == "") {
    //   if (field == 'encodeXsltSpec')
    //     message.error("Xslt Spec cannot be empty");
    //   else
    //     message.error("JsonAta Spec cannot be empty");
    //   return;
    // }
    // try {
    //   // const decodedValue = atob(encodedValue);
    //   const decodedValue = await decodeSpec(encodedValue);

    //   setModalContent(decodedValue);
    //   setModalType(field === 'encodeXsltSpec' ? 'xslt' : 'jsonata');
    //   setIsModalOpen(true);
    // } catch (error) {
    //   console.error(`Failed to decode ${field}:`, error);
    //   // Add error notification if needed
    // }
  };

  const handleModalOk = () => {
    const field = modalType === 'XSLT' ? 'encodeXsltSpec' : 'encodedJsonAtaSpec';
    form.setFieldValue(field, modalContent);
    setIsModalOpen(false);
    setIsJsonataModalOpen(false);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setIsJsonataModalOpen(false);
    setJoltModal(false);
  };

  const handleJoltSpec = () => {

    setJoltModal(true);
    setJolt(payloadData?.joltSpec);

  }

  const handleCloseModal = () => {
    setJoltModal(false);
  }

  console.log(payloadData?.type, "kkkk");
  

  return (
    <>
      <Row justify="start">
        <Col span={16}>
          <div style={{
            // height: 'cal(100vh - 100px)',
            // overflowY: 'auto',
            //   scroll= {{y: 'cal(100vh - 100px)'}}
            paddingRight: '16px'
          }}>
            <Form
              form={form}
              layout="horizontal"
              onFinish={onFinish}
              initialValues={initialValues}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 24 }}
              style={{ marginTop: '4%' }}
            >
              <Form.Item
                label={t('specName')}
                name="specName"
                rules={[{ required: true, message: "Spec Name is required" }]}
              >
                <Input onChange={handleSpecNameChange} />
              </Form.Item>

              <Form.Item
                label={t('description')}
                name="description"
                rules={[{ required: false }]}
              >
                <Input onChange={handleDescriptionChange} />
              </Form.Item>

              <Form.Item
                label={t('type')}
                name="type"
                required={false}
              >
                <Select
                  placeholder={t('typePlaceholder')}
                  defaultValue="JOLT"
                  onChange={handleTypeChange}
                >
                  <Option value="JOLT">JOLT</Option>
                  <Option value="XSLT">XSLT</Option>
                  <Option value="JSONATA">JSONATA</Option>
                </Select>
              </Form.Item>

              {payloadData?.type == "JOLT" && (
                <Form.Item
                  label={t('joltSpec')}
                  name="joltSpec"
                  rules={[
                    {
                      required: !disabledFields.joltSpec,
                      message: "Jolt Spec is required",
                    },
                  ]}
                >
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px' 
                    }}>
                    <TextArea
                      rows={15}
                      // autoSize={{ minRows: 3, maxRows: 5 }}
                      disabled={disabledFields.joltSpec}
                      value={(() => {
                        try {
                          return JSON.stringify(JSON.parse(payloadData?.joltSpec || ''), null, 2); // Format JSON for better readability
                        } catch (error) {
                          // console.error("Failed to parse joltSpec:", error);
                          return payloadData?.joltSpec || ''; // Return original value or empty string on error
                        }
                      })()}
                      onChange={(e) => handleTextAreaChange('joltSpec', e.target.value)}
                    />

                    <Button
                      onClick={() => handleJoltSpec()}
                      disabled={disabledFields.joltSpec}
                    >
                      {t('show')}
                    </Button>
                  </div>
                </Form.Item>
              )}



              {
                payloadData?.type == "XSLT" && <Form.Item
                  label={t('xsltSpec')}
                  name="xsltSpec"
                  rules={[{
                    required: !disabledFields.xsltSpec,
                    message: "XSLT Spec is required"
                  }]}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TextArea
                      rows={15}
                      style={{ resize: 'none', }}
                      disabled={disabledFields.xsltSpec}
                      onChange={(e) => handleTextAreaChange('xsltSpec', e.target.value)}
                      value={payloadData?.xsltSpec}
                    />
                    <Button
                      onClick={() => handleDecode('xsltSpec')}
                      disabled={disabledFields.encodeXsltSpec}
                    >
                      {t('show')}
                    </Button>
                  </div>
                </Form.Item>
              }

              {
                payloadData?.type == "XSLT1" && <Form.Item
                  label={t('encodeXsltSpec')}
                  name="encodeXsltSpec"
                  rules={[{
                    required: false,
                    // message: "Encoded XSLT Spec is required"
                  }]}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TextArea
                      rows={4}
                      disabled={true}
                      onChange={(e) => handleTextAreaChange('encodeXsltSpec', e.target.value)}
                      style={{ flex: 1 }}
                      value={payloadData?.encodeXsltSpec}
                    />
                    <Button
                      onClick={() => handleDecode('encodeXsltSpec')}
                      disabled={disabledFields.encodeXsltSpec}
                    >
                      {t('decode')}
                    </Button>
                  </div>
                </Form.Item>
              }

              {
                payloadData?.type == "JSONATA" &&
                <Form.Item
                  label={t('jsonAtaSpec')}
                  name="jsonataSpec"
                  rules={[{
                    required: !disabledFields.jsonataSpec,
                    message: "JsonAta Spec is required"
                  }]}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TextArea
                      rows={15}
                      style={{ resize: 'none', }}
                      disabled={disabledFields.jsonataSpec}
                      onChange={(e) => handleTextAreaChange('jsonataSpec', e.target.value)}
                      value={payloadData?.jsonataSpec}
                    />
                    <Button
                      onClick={() => handleDecode('jsonataSpec')}
                      disabled={disabledFields.encodedJsonAtaSpec}
                    >
                      {t('show')}
                    </Button>
                  </div>
                </Form.Item>
              }

              {
                payloadData?.type == "JSONATA1" && <Form.Item
                  label={t('encodedJsonAtaSpec')}
                  name="encodedJsonAtaSpec"
                  rules={[{
                    required: false,
                    // message: "Encoded JsonAta Spec is rrequired"
                  }]}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TextArea
                      rows={4}
                      disabled={true}
                      onChange={(e) => handleTextAreaChange('encodedJsonAtaSpec', e.target.value)}
                      style={{ flex: 1 }}
                      value={payloadData?.encodedJsonAtaSpec}
                    />
                    <Button
                      onClick={() => handleDecode('encodedJsonAtaSpec')}
                      disabled={disabledFields.encodedJsonAtaSpec}
                    >
                      {t('decode')}
                    </Button>
                  </div>
                </Form.Item>
              }

              {/* <Form.Item wrapperCol={{ span: 24 }}>
                <Button type="primary" htmlType="submit">
                  {t('submit')}
                </Button>
              </Form.Item> */}
            </Form>
          </div>
        </Col>
      </Row>

      <Modal
        title={t('xsltSpecification')}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={t('save')}
        cancelText={t('cancel')}
        footer={null}
      >
        <TextArea
          value={payloadData?.xsltSpec} // Set value based on modalType
          onChange={(e) => handleTextAreaChange('xsltSpec', e.target.value)} // Updated line
          rows={15}
          autoSize={false}
          style={{ width: '100%' }}
        />
      </Modal>

      <Modal
        title={t('jsonataSpecification')}
        open={isJsonataModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={t('save')}
        cancelText={t('cancel')}
        footer={null}
      >
        <TextArea
          value={payloadData?.jsonataSpec} // Set value based on modalType
          onChange={(e) => handleTextAreaChange('jsonataSpec', e.target.value)} // Updated line
          rows={15}
          autoSize={false}
          style={{ width: '100%' }}
        />
      </Modal>

      <Modal
        title={t("joltSpecification")}
        open={joltModal}
        footer={null}

        onCancel={handleCloseModal}
        okText={t('save')}
        cancelText={t('cancel')}
        width={800}
      >
        {/* <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px' }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {(() => {
              try {
                return JSON.stringify(JSON.parse(jolt), null, 2); // Parse and format JSON
              } catch (error) {
                return "Invalid JSON format"; // Fallback message for invalid JSON
              }
            })()}
          </pre>
        </div> */}
        <TextArea
          value={(() => {
            try {
              return JSON.stringify(JSON.parse(payloadData?.joltSpec || ''), null, 2); // Format JSON for better readability
            } catch (error) {
              // console.error("Failed to parse joltSpec:", error);
              return payloadData?.joltSpec || ''; // Return original value or empty string on error
            }
          })()} // Immediately invoked function to handle JSON parsing
          onChange={(e) => handleTextAreaChange('joltSpec', e.target.value)} // Updated line
          rows={15}
          autoSize={false}
          style={{ width: '100%' }}
        />
      </Modal>
    </>
  );
};

export default SpecForm;