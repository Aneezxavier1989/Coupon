export interface CouponData {
  userName: string;
  phone: string;
  email: string;
  businessName: string;
  discountType: string;
  discountValue: string;
  serialNumber: string;
  expiryDate: string;
}

export interface GeneratedCoupon {
  dataUrl: string;
  data: CouponData;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPOSITING = 'COMPOSITING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}