import { useState, useEffect } from 'react';
import { getMaterialData } from '@services/materialService';
import { MaterialItem } from '@modules/material/types/materialTypes';

const useMaterialData = () => {
  const [data, setData] = useState<MaterialItem[] | null>(null);

  useEffect(() => {
    getMaterialData().then((response) => setData(response));
  }, []);

  return data;
};

export default useMaterialData;
