/**
 * Programmatically generates a high-quality aesthetic background for coupons.
 * Uses mesh gradients and patterns to replace AI-generated backgrounds.
 */
export const generateBackground = (type: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 675;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    // Define color schemes based on campaign type
    let colors = ['#3b82f6', '#1e40af', '#60a5fa']; // Default Blue
    if (type === 'Holiday Special') colors = ['#b91c1c', '#7c2d12', '#f59e0b'];
    if (type === 'Flash Sale') colors = ['#7c3aed', '#4c1d95', '#c084fc'];
    if (type === 'Grand Opening') colors = ['#059669', '#064e3b', '#34d399'];

    // Draw mesh gradient
    const grad = ctx.createRadialGradient(
      canvas.width * 0.7, canvas.height * 0.2, 0,
      canvas.width * 0.7, canvas.height * 0.2, canvas.width
    );
    grad.addColorStop(0, colors[2]);
    grad.addColorStop(0.5, colors[0]);
    grad.addColorStop(1, colors[1]);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle grain/noise for a professional look
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const opacity = Math.random() * 0.05;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Add decorative subtle circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 300,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    resolve(canvas.toDataURL('image/png'));
  });
};
