import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { companyNameState } from '../atoms';

const DocumentTitle = () => {
  const companyName = useRecoilValue(companyNameState);

  useEffect(() => {
    document.title = companyName || 'Inventory System';
  }, [companyName]);

  return null;
};

export default DocumentTitle;