import React, { useEffect, useState } from "react";
import { Form, Input, Select, DatePicker, Modal, Table } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { DynamicBrowse } from "@components/BrowseComponent";
import {
  bomTypeOptions,
  FormValues,
  inUseOptions,
  orderTypeOptions,
  statusOptions,
} from "@modules/processOrderMaintenance/types/processTypes";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";
import { fetchAllWorkCenter } from "@services/workCenterService";
import {
  fetchAllMaterial,
  fetchTop50Material,
} from "@services/cycleTimeService";
import {
  fetchAllRecipe,
  fetchTop50Recipe,
} from "@services/processOrderService";

interface DynamicFormProps {
  data: any;
  fields: string[];
  onValuesChange: (changedValues: FormValues) => void;
}

const { Option } = Select;
const unitOptions = [
  { value: "KG", label: "Kilogram (kg)" },
  { value: "G", label: "Gram (g)" },
  { value: "MM", label: "Millimeter (mm)" },
  { value: "M", label: "Meter (m)" },
  { value: "CM", label: "Centimeter (cm)" },
  { value: "L", label: "Liter (l)" },
  { value: "EA", label: "Each (ea)" },
];

const DynamicForm: React.FC<DynamicFormProps> = ({
  data,
  fields,
  onValuesChange,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [plannedMaterial, setPlannedMaterial] = useState<string | undefined>(
    data?.material
  );
  const [plannedRecipe, setPlannedRecipe] = useState<string | undefined>(
    data?.recipe
  );

  const [materialData, setMaterialData] = useState<any[]>([]);
  const [materialVisible, setMaterialVisible] = useState(false);

  const [recipeData, setRecipeData] = useState<any[]>([]);
  const [recipeVisible, setRecipeVisible] = useState(false);

  const uiPlaner: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: t("selectMaterial"),
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: "workcenter",
    tabledataApi: "item-service",
  };

  const uiRecipe: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: t("selectRecipe"),
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: "retrieveAll",
    tabledataApi: "recipe-service",
  };

  useEffect(() => {
    const parseDateString = (dateStr: string | null | undefined) => {
      if (!dateStr) return null;
      const date = dayjs(dateStr);
      return date.isValid() ? date : null;
    };

    form.setFieldsValue({
      ...data,
      startDate: parseDateString(data?.startDate),
      finishDate: parseDateString(data?.finishDate),
      schedStartTime: parseDateString(data?.schedStartTime),
      schedFinTime: parseDateString(data?.schedFinTime),
    });
    setPlannedMaterial(data?.material);
    setPlannedRecipe(data?.recipe);
  }, [data, form]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    let newValue = e.target.value.trimStart();

    // Define regex patterns for validation
    const patterns: { [key: string]: RegExp } = {
      material: /^[A-Z0-9_]*$/,
      orderNumber: /^[A-Z0-9_]*$/,
      recipe: /^[A-Z0-9_]*$/,
    };

    // Remove special characters except underscores for most cases
    newValue = newValue.replace(/[^a-zA-Z0-9_]/g, "");

    switch (key) {
      case "userId":
        if (patterns.userId.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      case "material":
      case "orderNumber":
      case "materialVersion":
      case "recipe":
      case "recipeVersion":
        newValue = newValue.toUpperCase();
        if (patterns[key].test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      default:
        form.setFieldsValue({ [key]: newValue });
        onValuesChange({ [key]: newValue });
        break;
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null, key: string) => {
    // Store the dayjs object in the form
    form.setFieldsValue({ [key]: date });
    // Send the ISO formatted string to parent component
    const isoDateString = date ? date.toISOString() : null;
    onValuesChange({ [key]: isoDateString });
  };

  const handlePlannedMaterial = (newValues: any[]) => {
    if (newValues.length === 0) {
      setPlannedMaterial("");
      onValuesChange({ material: "", materialVersion: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].item;
      const newVersion = newValues[0].revision;
      setPlannedMaterial(newValue);
      onValuesChange({
        material: newValue.toUpperCase(),
        materialVersion: newVersion.toUpperCase(),
      });
    }
  };

  const handlePlannedRecipe = (newValues: any[]) => {
    if (newValues.length === 0) {
      setPlannedRecipe("");
      onValuesChange({ recipe: "", recipeVersion: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].recipeId;
      const newVersion = newValues[0].version;
      setPlannedRecipe(newValue);
      onValuesChange({
        recipe: newValue.toUpperCase(),
        recipeVersion: newVersion.toUpperCase(),
      });
    }
  };

  // material

  const handlePlannedMaterialClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue("material");

    const newValue = {
      item: typedValue,
    };

    try {
      let response;
      if (typedValue) {
        response = await fetchAllMaterial(site, newValue);
      } else {
        response = await fetchTop50Material(site);
      }

      if (response && !response.errorCode) {
        const formattedData = response.itemList.map(
          (item: any, index: number) => ({
            id: index,
            ...item,
          })
        );
        setMaterialData(formattedData);
      } else {
        setMaterialData([]);
      }
    } catch (error) {
      console.error("Error", error);
    }

    setMaterialVisible(true);
  };

  const handlePlannedMaterialOk = (selectedRow: any | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        material: selectedRow.item,
        materialVersion: selectedRow.revision,
      });
      onValuesChange({
        material: selectedRow.item,
        materialVersion: selectedRow.revision,
      });
    }

    setMaterialVisible(false);
  };

  const materialColumn = [
    {
      title: t("item"),
      dataIndex: "item",
      key: "item",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
    },
  ];

  // recipe

  const handleRecipeClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue("recipe");

    const newValue = {
      recipeId: typedValue,
    };

    try {
      let response;
      if (typedValue) {
        response = await fetchAllRecipe(site, newValue);
      } else {
        response = await fetchTop50Recipe(site);
        console.log(response, "response");
      }

      if (response && !response.errorCode) {
        const formattedData = response.responseList.map(
          (item: any, index: number) => ({
            id: index,
            ...item,
          })
        );
        setRecipeData(formattedData);
      } else {
        setRecipeData([]);
      }
    } catch (error) {
      console.error("Error", error);
    }

    setRecipeVisible(true);
  };

  const handleRecipeOk = (selectedRow: any | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        recipe: selectedRow.recipeId,
        recipeVersion: selectedRow.version,
      });
      onValuesChange({
        recipe: selectedRow.recipeId,
        recipeVersion: selectedRow.version,
      });
    }

    setRecipeVisible(false);
  };

  const recipeColumn = [
    {
      title: t("recipeId"),
      dataIndex: "recipeId",
      key: "recipeId",
    },
    {
      title: t("version"),
      dataIndex: "version",
      key: "version",
    },
  ];

  const handleCancel = () => {
    setMaterialVisible(false);
    setRecipeVisible(false);
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      onValuesChange={(changedValues) =>
        onValuesChange(changedValues as FormValues)
      }
      style={{ width: "80%" }}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      {fields.map((key) => {
        const value = data[key];
        if (value === undefined) {
          return null;
        }

        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        if (key === "status") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Select defaultValue={value}>
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        // if (key === 'inUse') {
        //   return (
        //     <Form.Item
        //       key={key}
        //       name={key}
        //       label={t(`${key}`)}
        //     >
        //       <Select defaultValue={value}>
        //         {inUseOptions.map((option, index) => (
        //           <Option key={index} value={option.value}>
        //             {option.label}
        //           </Option>
        //         ))}
        //       </Select>
        //     </Form.Item>
        //   );
        // }

        if (key === "orderType") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Select defaultValue={value}>
                {orderTypeOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        if (key === "targetQuantity") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)} required>
              <Input
                type="number"
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }
        if (key === "priority") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Input
                type="number"
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }
        if (key === "material") {
          return (
            // <Form.Item
            //   key={key}
            //   name={key}
            //   label={t(`${key}`)}
            //   required
            // >
            //   <DynamicBrowse
            //     uiConfig={uiPlaner}
            //     initial={plannedMaterial}
            //     onSelectionChange={handlePlannedMaterial}
            //   />
            // </Form.Item>

            <Form.Item key={key} name={key} label={t(`${key}`)} required>
              <Input
                suffix={
                  <GrChapterAdd onClick={() => handlePlannedMaterialClick()} />
                }
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === "recipe") {
          return (
            // <Form.Item
            //   key={key}
            //   name={key}
            //   label={t(`${key}`)}
            //   required
            // >
            //   <DynamicBrowse
            //     uiConfig={uiRecipe}
            //     initial={plannedRecipe}
            //     onSelectionChange={handlePlannedRecipe}
            //   />
            // </Form.Item>

            <Form.Item key={key} name={key} label={t(`${key}`)} required>
              <Input
                suffix={<GrChapterAdd onClick={() => handleRecipeClick()} />}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === "orderNumber") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)} required>
              <Input
                type="text"
                autoComplete="off"
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === "unit") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Select defaultValue={value}>
                {unitOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (
          key === "startDate" ||
          key === "finishDate" ||
          key === "schedStartTime" ||
          key === "schedFinTime"
        ) {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <DatePicker
                showTime={{ format: "HH:mm:ss" }}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={(date) => handleDateChange(date, key)}
                style={{ width: "100%" }}
                allowClear
              />
            </Form.Item>
          );
        }

        if (key === "availableQtyToRelease") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Input
                type="text"
                disabled
                autoComplete="off"
                defaultValue={value}
              />
            </Form.Item>
          );
        }

        return (
          <Form.Item key={key} name={key} label={t(`${key}`)}>
            <Input
              defaultValue={value}
              onChange={(e) => handleInputChange(e, key)}
            />
          </Form.Item>
        );
      })}

      <Modal
        title={t("selectMaterial")}
        open={materialVisible}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: "auto" }}
          onRow={(record) => ({
            onDoubleClick: () => handlePlannedMaterialOk(record),
          })}
          columns={materialColumn}
          dataSource={materialData}
          rowKey="material"
          pagination={false}
          scroll={{ y: 'calc(100vh - 350px)' }}
        />
      </Modal>

      <Modal
        title={t("selectRecipe")}
        open={recipeVisible}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: "auto" }}
          onRow={(record) => ({
            onDoubleClick: () => handleRecipeOk(record),
          })}
          columns={recipeColumn}
          dataSource={recipeData}
          rowKey="recipe"
          pagination={false}
          scroll={{ y: 'calc(100vh - 350px)' }}
        />
      </Modal>
    </Form>
  );
};

export default DynamicForm;
