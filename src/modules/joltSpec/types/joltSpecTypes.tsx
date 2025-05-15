

export interface SpecFormData {
  joltSpec: string;
  xsltSpec: string;
  encodeXsltSpec: string;
  jsonataSpec: string;
  encodedJsonataSpec: string;
  type: string;
  specName: string;
  description: string;
}

export const defaultSpecFormData: SpecFormData = {
  joltSpec: '',
  xsltSpec: '',
  encodeXsltSpec: '',
  jsonataSpec: '',
  encodedJsonataSpec: '',
  type: "JOLT",
  specName: '',
  description: '',
};