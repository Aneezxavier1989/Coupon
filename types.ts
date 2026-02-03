
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
  GENERATING_BACKGROUND = 'GENERATING_BACKGROUND',
  COMPOSITING = 'COMPOSITING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
