import computerForm from "../../assets/components/JSON/computerform.json";
import monitorForm from "../../assets/components/JSON/monitorform.json";
import audioForm from "../../assets/components/JSON/audioform.json";
import peripheralsForm from "../../assets/components/JSON/peripheralsform.json";
import merchandisingForm from "../../assets/components/JSON/merchandisingform.json";
import othersForm from "../../assets/components/JSON/othersform.json";
import phoneForm from "../../assets/components/JSON/phoneform.json";

export interface FormField {
  name: string;
  title: string;
  options: string[];
}

export interface FormFieldsData {
  fields: FormField[];
}

const formFieldsMap: Record<string, FormFieldsData> = {
  computer: computerForm as FormFieldsData,
  monitor: monitorForm as FormFieldsData,
  audio: audioForm as FormFieldsData,
  peripherals: peripheralsForm as FormFieldsData,
  merchandising: merchandisingForm as FormFieldsData,
  other: othersForm as FormFieldsData,
  phone: phoneForm as FormFieldsData,
};

export const loadFormFields = (category: string): FormField[] => {
  const normalizedCategory = category.toLowerCase();
  const formData = formFieldsMap[normalizedCategory];

  if (!formData) {
    console.warn(`No form fields found for category: ${category}`);
    return [];
  }

  return formData.fields || [];
};

export const getFieldOptions = (
  category: string,
  fieldName: string
): string[] => {
  const fields = loadFormFields(category);
  const field = fields.find((f) => f.name === fieldName);
  return field?.options || [];
};
