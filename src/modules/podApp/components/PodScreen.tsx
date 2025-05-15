import React, { Suspense, lazy, useContext } from 'react';
import { Button, Card, Modal, Flex, Splitter } from 'antd';
import { PodContext } from '@modules/podApp/hooks/userContext';
import AssemblyMain from '@modules/assembly/components/Assembly';
import DCMain from '@modules/dcPlugin/components/DcPlugin';
import WIMain from '@modules/wiPlugin/components/WiPlugin';
import ScrapUnscrapPlugin from '@modules/scrapUnscrapPlugin/components/ScrapUnscrapPlugin';``
import ProcessOrderMain from '@modules/phaseListPlugin/components/PhaseListMain';
import { IoMdClose } from "react-icons/io";
import LogNCMain from '@modules/logNC/components/LogNCMain';
import LogToolMain from '@modules/logTool/components/LogTool';
import DynamicTable from './DynamicTable';
import LineClearancePlugin from '@modules/lineClearancePlugin/LineClearancePlugin';
import LogBuyOff from '@modules/logBuyOff/components/LogBuyOffMain';
import OpcPlugin from '@modules/opcplugin/opcPlugin';
import ChangeHoldStatus from '@modules/changeHoldStatus/changeHoldStatus';
import ChangeUnHoldStatus from '@modules/changeUnHoldStatus/changeUnHoldStatus';
import PcoPlugin from '@modules/pcoPlugin/components/PcoPlugin';
import SignOffPlugin from '@modules/signOffPlugin/signOffplugin';
import CompleteMain from '@modules/completePlugin/components/CompleteMain';

// Lazy-loaded components
const ChangeEquipmentStatuss = lazy(() => import('@modules/changeEquipmentStatus/components/ChangeEquipmentStatus'));
const YieldConfirmation = lazy(() => import('@modules/yieldConfirmation/components/YieldConfirmation'));

interface Container {
  content: string;
  buttonLabel: string;
  buttonId: string;
  pluginLocation: number;
  url: string;
}

interface ContainerComponentProps {
  containers: Container[];
  onRemoveContainer: (content: string) => void;
  selectedContainer: any | null;
  onCloseModal: () => void;
  setCall2: (value: number) => void;
  call2: number;
  allBtn: any;
  setSelectedContainer: (value: any) => void;
}

const CustomTitle = ({ text }) => (
  <div style={{
    textAlign: 'center',
    width: '100%',
    padding: '10px',
    borderBottom: '1px solid #d9d9d9'
  }}>
    {text}
  </div>
);

const componentMapping = {
 'http://localhost:8585/rits/assemblyPlugin_app/index.html': AssemblyMain,
  '/rits/changeEquipmentStatus_app/index.html': ChangeEquipmentStatuss,
  '/rits/workInstruction_app': WIMain,
  '/rits/dccollect_app/index.html': DCMain,
  '/rits/scrap_app/index.html': ScrapUnscrapPlugin,
  '/rits/processOrder_app/index.html': ProcessOrderMain,
  '/rits/yieldConfirmation_app/': YieldConfirmation,
  '/rits/logNC': LogNCMain,
  '/rits/log_tool': LogToolMain,
  '/rits/logBuyOff': LogBuyOff,
  '/rits/lineclearance': LineClearancePlugin,
  '/rits/workListPanel': DynamicTable,
  '/rits/opc_plugin': OpcPlugin,
  '/rits/changeHoldStatus' :ChangeHoldStatus,
  '/rits/changeUnHoldStatus_app/index.html' :ChangeUnHoldStatus,
  '/rits/pco_plugin': PcoPlugin,
  '/rits/signOff_plugin': SignOffPlugin,
  '/rits/completePlugin_app': CompleteMain
};

const ContainerComponent: React.FC<ContainerComponentProps> = ({ allBtn,  call2, setCall2, containers, onRemoveContainer, selectedContainer, onCloseModal,setSelectedContainer }) => {
  const { filterFormData, selectedRowData ,data ,setSelectedRowData,list,loading,setFilterFormData,call1,setCall1,setPhaseId,phaseByDefault } = useContext(PodContext);

  // Filter UI5 components from allBtn and exclude pluginLocation "99"
  const ui5Components = (allBtn || []).filter(btn =>
    btn?.activityList?.some(activity =>
      activity?.type?.toLowerCase() === "ui" && activity?.pluginLocation !== "99"
    )
  );

  // Map UI5 components to the format needed for containers
  const ui5Containers = ui5Components.map(btn => ({
    content: btn?.buttonId,
    buttonLabel: btn?.buttonLabel,
    buttonId: btn?.buttonId,
    pluginLocation: btn?.activityList[0]?.pluginLocation,
    url: btn?.activityList[0]?.url
  }));

  const getComponentForUrl = (url: string ,onRemoveContainer: (content: string) => void,buttonId:string,  buttonLabel:string) => {
        const Component = componentMapping[url];
        return Component ? <Component data={data}
        loading={loading}
        setSelectedRowData={setSelectedRowData} onCloseModal
        setSelectedContainer={setSelectedContainer}
        list={list} buttonLabel={buttonLabel} onRemoveContainer={onRemoveContainer} phaseByDefault={phaseByDefault} buttonId={buttonId}
         selectedContainer={selectedContainer} setPhaseId={setPhaseId} filterFormData={filterFormData} call2={call2} setCall2={setCall2} 
         selectedRowData={selectedRowData} setFilterFormData={setFilterFormData} call1={call1} setCall1={setCall1} /> : <></>;
      };
      

  return (
    <div style={{ height: '100%', width: '100%', }}>
      <Flex vertical gap="middle" style={{ width: '100%', height: '100%' }}>
        {containers && (() => {
          // First, get the workListPanel item with pluginLocation 1 if it exists
          const workListPanel = containers.find(
            container => container.pluginLocation === 1 && container.url === '/rits/workListPanel'
          );

          // If workListPanel exists, use it, otherwise get the first item with pluginLocation 1
          const processOrderContainers = workListPanel 
            ? [workListPanel]
            : containers.filter(container => container.pluginLocation === 1).slice(0, 1);

          // Get all other containers and sort by pluginLocation
          const otherContainers = containers
            .filter(container => !processOrderContainers.includes(container))
            .sort((a, b) => (a.pluginLocation || 0) - (b.pluginLocation || 0));

          console.log(otherContainers,"otherContainers");
          return (
            <>
              {/* Process Order containers */}
              {processOrderContainers.map((container, idx) => (
                <Splitter 
                  key={`po-${idx}`} 
                  style={{ 
                    height: '300px', 
                    width: '100%',
                    minHeight: '35vh', 
                    paddingLeft: '0px',
                    // marginBottom: '16px'
                  }}
                >
                  <Splitter.Panel 
                    collapsible 
                    style={{ 
                      overflow: 'hidden',
                      width: '100%',
                      paddingLeft: '0px',
                      // minWidth: '300px'
                      height: 'calc(100vh - 63vh)',
                    }}
                  >
                    <Card
                       title={container?.url === '/rits/workListPanel' ? null : container?.buttonLabel}
                      style={{ 
                        boxShadow: '2px 4px 4px 4px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        height: '100%',
                        margin: '0px 10px',
                        borderRadius: '10px',
                        display: 'flex',
                        paddingLeft: '0px',
                        flexDirection: 'column'
                      }}
                      extra={
                        container?.url !== '/rits/workListPanel' &&
                        <Button 
                          type="text" 
                          icon={<IoMdClose size={20} />} 
                          onClick={() => onRemoveContainer(container?.content) }
                          style={{
                            border: 'none',
                            padding: '4px 8px',
                            height: 'auto',
                            lineHeight: 1,
                            color: '#fff'
                          }}
                        />
                      }
                      headStyle={{
                        padding: '0 8px',
                        minHeight: '32px',
                        height: '32px',
                        lineHeight: '32px',
                        backgroundColor: '#006568',
                        color: '#fff'
                      }}
                      bodyStyle={{ 
                        padding: '0px 8px',
                        flex: 1,
                        minHeight: '350px',
                        height: '100%',
                        overflowY: 'auto',
                        paddingLeft: '0px',
                        overflowX: 'hidden'
                      }}
                    >
                      {getComponentForUrl(container?.url,onRemoveContainer,container?.buttonId,container?.buttonLabel)}
                    </Card>
                  </Splitter.Panel>
                </Splitter>
              ))}

              {/* Other containers */}
              {[...Array(Math.ceil(otherContainers.length / 3))].map((_, rowIndex) => {
                const currentRowContainers = otherContainers.slice(rowIndex * 3, (rowIndex + 1) * 3);
                return (
                  <Splitter 
                    key={`row-${rowIndex}`} 
                    style={{ 
                      height: 'calc(100vh - 200px)',
                      width: '100%',
                      minHeight: '400px'
                    }}
                  >
                    {currentRowContainers.map((container, idx) => (
                      <Splitter.Panel 
                        key={`${rowIndex}-${idx}`} 
                        collapsible 
                        style={{ 
                          overflow: 'hidden',
                          width: `${100 / Math.min(3, currentRowContainers.length)}%`,
                          // minWidth: '300px',
                          
                        }}
                      >
                        <Card
                          title={container?.url === '/rits/workListPanel' ? null : container?.buttonLabel}
                          style={{ 
                            boxShadow: '2px 4px 4px 4px rgba(0, 0, 0, 0.1)',
                            width: '100%',
                            height: '100%',
                            margin: '0px 10px',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          extra={
                            container?.url !== '/rits/workListPanel' &&
                            <Button 
                              type="text" 
                              icon={<IoMdClose size={20} />} 
                              onClick={() => onRemoveContainer(container?.content)}
                              style={{
                                border: 'none',
                                padding: '4px 8px',
                                height: 'auto',
                                lineHeight: 1,
                                color: '#fff'
                              }}
                            />
                          }
                          headStyle={{
                            padding: '0 8px',
                            minHeight: '32px', 
                            height: '32px',
                            lineHeight: '32px',
                            backgroundColor: 'var(--background-color)',
                            color: 'var(--text-color)',
                            display: container?.url === '/rits/workListPanel' ? 'none' : 'block'
                          }}
                          bodyStyle={{ 
                            padding: '0px 8px',
                            flex: 1,
                            minHeight: '350px',
                            height: '100%',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                          }}
                        >
                          {getComponentForUrl(container?.url,onRemoveContainer,container?.buttonId,container?.buttonLabel)}
                        </Card>
                      </Splitter.Panel>
                    ))}
                  </Splitter>
                );
              })}
            </>
          );
        })()}
      </Flex>

      <Modal
        title={<CustomTitle text={selectedContainer?.buttonLabel || 'Default Title'} />}
        visible={!!selectedContainer}
        onCancel={onCloseModal}
        width={1200}
        style={{ 
          top: 20,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        bodyStyle={{
          height: 'calc(90vh - 110px)',
          overflowY: 'auto',
          padding: '20px',
          flex: 1
        }}
        footer={[
          // <Button key="back" onClick={onCloseModal}>
          //   Close
          // </Button>,
        ]}
      >
        <Suspense fallback={<div>Loading...</div>}>
          {selectedContainer ? getComponentForUrl(selectedContainer?.url,onRemoveContainer,selectedContainer?.buttonId,selectedContainer?.buttonLabel) : null}
        </Suspense>
      </Modal>
    </div>
  );
};

export default ContainerComponent;