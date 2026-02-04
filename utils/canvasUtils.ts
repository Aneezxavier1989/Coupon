import { CouponData } from '../types';
import { SN_LOGO_DATA } from '../assets/logo';

export const compositeCoupon = (
  backgroundImageUrl: string,
  data: CouponData
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const bgImg = new Image();
    const logoImg = new Image();
    bgImg.crossOrigin = "anonymous";
    logoImg.crossOrigin = "anonymous";

    let bgLoaded = false;
    let logoLoaded = false;

    const tryRender = () => {
      if (bgLoaded && logoLoaded) {
        render();
      }
    };

    bgImg.onload = () => {
      bgLoaded = true;
      tryRender();
    };
    bgImg.onerror = () => reject("Background image failed to load");

    logoImg.onload = () => {
      logoLoaded = true;
      tryRender();
    };
    logoImg.onerror = () => {
      console.warn("Overlay logo failed to load, proceeding with fallback.");
      logoLoaded = true;
      tryRender();
    };

    bgImg.src = backgroundImageUrl;
    logoImg.src = SN_LOGO_DATA;

    const render = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Could not get canvas context");

      const BRAND_GOLD = '#B68D40';
      const DARK_NAVY = '#1e293b';
      const LIGHT_SLATE = '#64748b';

      // 1. Draw luxury background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // 2. Draw Main White Card
      const cardPadding = 60;
      const cardW = canvas.width - (cardPadding * 2);
      const cardH = canvas.height - (cardPadding * 2);
      
      ctx.beginPath();
      ctx.roundRect(cardPadding, cardPadding, cardW, cardH, 30);
      ctx.fillStyle = '#FFFFFF'; 
      ctx.fill();

      // Card Border
      ctx.strokeStyle = '#262626';
      ctx.lineWidth = 14;
      ctx.stroke();

      // 3. BACKGROUND LOGO OVERLAY (Watermark)
      // This is the new "SN" monogram as a subtle background element
      ctx.save();
      ctx.globalAlpha = 0.04; // Very subtle transparency
      const logoScale = 0.8; 
      const logoWidth = 300 * logoScale;
      const logoHeight = 588 * logoScale;
      
      // Center the logo on the white card
      const logoX = (canvas.width / 2) - (logoWidth / 2);
      const logoY = (canvas.height / 2) - (logoHeight / 2);
      
      // If logo fails to load as image, draw a text-based elegant monogram as fallback
      if (logoImg.complete && logoImg.naturalWidth !== 0) {
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
      } else {
        ctx.font = 'italic 400px "Times New Roman", serif';
        ctx.fillStyle = BRAND_GOLD;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("SN", canvas.width / 2, canvas.height / 2);
      }
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 4. Header Section
      const headerY = 150;

      // Business Name
      ctx.font = 'bold 48px Inter';
      ctx.fillStyle = DARK_NAVY;
      ctx.fillText(data.businessName.toUpperCase(), canvas.width / 2, headerY);

      // Sub-text
      ctx.font = '600 14px Inter';
      ctx.fillStyle = BRAND_GOLD;
      ctx.letterSpacing = "12px";
      ctx.fillText("SALON AND BOUTIQUE", canvas.width / 2, headerY + 45);
      ctx.letterSpacing = "0px";

      // 5. Content Section
      // Category
      ctx.font = '500 18px Inter';
      ctx.fillStyle = LIGHT_SLATE;
      ctx.fillText(data.discountType.toUpperCase(), canvas.width / 2, 240);

      // Hero Discount Text
      ctx.font = '900 100px Inter';
      ctx.fillStyle = DARK_NAVY;
      const discountText = data.discountValue.toUpperCase();
      const maxTextWidth = cardW - 180;
      let metrics = ctx.measureText(discountText);
      if (metrics.width > maxTextWidth) {
        ctx.font = `900 ${Math.floor(100 * (maxTextWidth / metrics.width))}px Inter`;
      }
      ctx.fillText(discountText, canvas.width / 2, 340);

      // Prepared For
      ctx.font = 'bold 24px Inter';
      ctx.fillStyle = BRAND_GOLD;
      ctx.fillText(`PREPARED FOR: ${data.userName.toUpperCase()}`, canvas.width / 2, 440);

      // 6. Footer Details
      const footerDividerY = 500;
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(cardPadding + 140, footerDividerY);
      ctx.lineTo(canvas.width - cardPadding - 140, footerDividerY);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Serial & Expiry
      ctx.font = 'bold 18px Inter';
      ctx.fillStyle = DARK_NAVY;
      ctx.fillText(`VOUCHER ID: ${data.serialNumber}`, canvas.width / 2, 535);

      ctx.font = '500 14px Inter';
      ctx.fillStyle = LIGHT_SLATE;
      ctx.fillText(`VALID UNTIL: ${data.expiryDate}`, canvas.width / 2, 565);

      resolve(canvas.toDataURL('image/png'));
    };
  });
};