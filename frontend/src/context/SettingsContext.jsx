import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DEFAULT = {
  payment: {
    mtnMomoEnabled: true,
    orangeMoneyEnabled: true,
    cashOnDeliveryEnabled: true,
    bankTransferEnabled: true,
    stripeEnabled: false,
  },
  shipping: {
    freeShippingThreshold: 50000,
    defaultShippingCost: 2000,
  },
  general: {
    siteName: 'CHANCELOR STORE',
    sitePhone: '+237 674 962 803',
    maintenanceMode: false,
  },
};

const SettingsContext = createContext({ settings: DEFAULT, refreshSettings: () => {}, loading: true });

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [payment, shipping, general] = await Promise.all([
        api.get('/settings/payment'),
        api.get('/settings/shipping'),
        api.get('/settings/general'),
      ]);
      setSettings({
        payment: payment.data?.data ?? DEFAULT.payment,
        shipping: shipping.data?.data ?? DEFAULT.shipping,
        general: general.data?.data ?? DEFAULT.general,
      });
    } catch {
      // keep defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchAll, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
