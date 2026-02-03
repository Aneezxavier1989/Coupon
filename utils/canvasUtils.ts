
import { CouponData } from '../types';

export const compositeCoupon = (
  backgroundImageUrl: string,
  data: CouponData
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Could not get canvas context");

      // Draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add semi-transparent overlay for readability
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

      // Drawing styles
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Business Name
      ctx.font = 'bold 48px Inter';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(data.businessName.toUpperCase(), canvas.width / 2, 140);

      // Divider line
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 100, 180);
      ctx.lineTo(canvas.width / 2 + 100, 180);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();

      // Discount Type / Header
      ctx.font = '500 32px Inter';
      ctx.fillStyle = '#64748b';
      ctx.fillText(data.discountType, canvas.width / 2, 230);

      // Main Value
      ctx.font = '900 120px Inter';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(data.discountValue, canvas.width / 2, 350);

      // User Name
      ctx.font = '600 38px Inter';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`EXCLUSIVELY FOR: ${data.userName}`, canvas.width / 2, 460);

      // Serial & Expiry
      ctx.font = '400 24px Inter';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`SERIAL: ${data.serialNumber}`, canvas.width / 2, 530);
      ctx.fillText(`VALID UNTIL: ${data.expiryDate}`, canvas.width / 2, 570);
      
      // Small email at the bottom
      if (data.email) {
        ctx.font = 'italic 18px Inter';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(data.email.toLowerCase(), canvas.width / 2, 610);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject("Image failed to load");
    img.src = backgroundImageUrl;
  });
};
