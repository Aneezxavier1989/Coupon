/**
 * Programmatically generates a luxury aesthetic background for coupons.
 * Uses mesh gradients with gold and bronze highlights.
 */
export const generateBackground = (type: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 675;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    const BRAND_GOLD = '#B68D40';
    const BRAND_BRONZE = '#8a6523';
    const LUXURY_DARK = '#1a1a1a';

    // Base Luxury Background
    let colors = [LUXURY_DARK, '#262626', BRAND_GOLD]; 
    
    // Slight variations for different types but maintaining luxury gold theme
    if (type === 'Holiday Special') colors = ['#3d0a0a', '#1a0404', BRAND_GOLD];
    if (type === 'Bridal Package') colors = ['#fffbf0', '#f5e8c7', BRAND_GOLD];
    if (type === 'Grand Opening') colors = ['#0a1f1a', '#030a08', BRAND_GOLD];

    // Draw main mesh/radial gradient
    const grad = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.2, 0,
      canvas.width * 0.8, canvas.height * 0.2, canvas.width
    );
    grad.addColorStop(0, colors[2]); // Gold accent
    grad.addColorStop(0.6, colors[1]); // Mid tone
    grad.addColorStop(1, colors[0]); // Base dark

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add gold "shimmer" particles
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      const opacity = Math.random() * 0.4;
      ctx.fillStyle = `rgba(182, 141, 64, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add subtle decorative arcs/swirls (reminiscent of the logo style)
    ctx.strokeStyle = `rgba(182, 141, 64, 0.08)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 500,
        0, Math.PI * 2
      );
      ctx.stroke();
    }

    // Top subtle texture overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }

    resolve(canvas.toDataURL('image/png'));
  });
};