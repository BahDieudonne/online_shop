import { DevicePhoneMobileIcon, CreditCardIcon, BuildingLibraryIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export const SITE_NAME = 'CHANCELOR STORE';
export const CURRENCY = 'XAF';
export const CURRENCY_SYMBOL = 'FCFA';
export const WHATSAPP_NUMBER = '237674962803';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ORDER_STATUSES = {
  pending:           { label: 'Pending',             color: 'yellow' },
  confirmed:         { label: 'Confirmed',           color: 'blue' },
  processing:        { label: 'Processing',          color: 'indigo' },
  shipped:           { label: 'Shipped',             color: 'purple' },
  out_for_delivery:  { label: 'Out for Delivery',    color: 'orange' },
  delivered:         { label: 'Delivered',           color: 'green' },
  cancelled:         { label: 'Cancelled',           color: 'red' },
  refunded:          { label: 'Refunded',            color: 'gray' },
};

export const PAYMENT_METHODS = [
  { id: 'mtn_momo',         label: 'MTN Mobile Money',  Icon: DevicePhoneMobileIcon, color: '#ffcc00' },
  { id: 'orange_money',     label: 'Orange Money',      Icon: DevicePhoneMobileIcon, color: '#ff6600' },
  { id: 'stripe',           label: 'Credit/Debit Card', Icon: CreditCardIcon,        color: '#635bff' },
  { id: 'paypal',           label: 'PayPal',            Icon: CreditCardIcon,        color: '#003087' },
  { id: 'bank_transfer',    label: 'Bank Transfer',     Icon: BuildingLibraryIcon,   color: '#1a237e' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery',  Icon: BanknotesIcon,         color: '#2e7d32' },
];

export const CAMEROON_REGIONS = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord',
  'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
];
