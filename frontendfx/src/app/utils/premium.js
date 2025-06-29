import api from '../../utils/api';

export const fetchPremiumPrice = async () => {
  try {
    const res = await api.get('/api/system/premium-price');
    return res.data.price;
  } catch (err) {
    return null;
  }
};
