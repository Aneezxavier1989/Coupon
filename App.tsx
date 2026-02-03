import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Ticket,
  User,
  Building,
  Zap,
  CalendarDays,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { CouponData, GeneratedCoupon, GenerationStatus } from './types';
import { generateBackground } from './services/backgroundService';
import { compositeCoupon } from './utils/canvasUtils';
import AdminPage from './AdminPage';

const getDefaultExpiry = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
};

const App: React.FC = () => {
  const [view, setView] = useState<'designer' | 'admin'>('designer');
  const [formData, setFormData] = useState<Omit<CouponData, 'serialNumber'>>({
    userName: '',
    phone: '',
    email: '',
    businessName: 'Sprit N Soul',
    discountType: 'Customer Loyalty',
    discountValue: '20% DISCOUNT',
    expiryDate: getDefaultExpiry(),
  });

  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [generatedCoupon, setGeneratedCoupon] = useState<GeneratedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSerial = () => {
    return 'CPN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveToStorage = (coupon: GeneratedCoupon) => {
    try {
      const existing = localStorage.getItem('ai_coupons');
      const coupons = existing ? JSON.parse(existing) : [];
      const couponWithMeta = { ...coupon, createdAt: new Date().toISOString() };
      localStorage.setItem('ai_coupons', JSON.stringify([couponWithMeta, ...coupons]));
    } catch (e) {
      console.error('Storage error:', e);
      setError('Local storage is full. Please go to the Admin Panel and clear old records.');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.businessName || !formData.expiryDate) return;

    setStatus(GenerationStatus.PROCESSING);
    setError(null);

    // Artificial delay for smooth UI feedback
    await new Promise(r => setTimeout(r, 800));

    try {
      const backgroundUrl = await generateBackground(formData.discountType);
      setStatus(GenerationStatus.COMPOSITING);
      
      const fullData: CouponData = {
        ...formData,
        serialNumber: generateSerial(),
        expiryDate: new Date(formData.expiryDate).toLocaleDateString(),
      };

      const finalImage = await compositeCoupon(backgroundUrl, fullData);
      const newCoupon = { dataUrl: finalImage, data: fullData };

      setGeneratedCoupon(newCoupon);
      saveToStorage(newCoupon);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(GenerationStatus.ERROR);
      setError('Generation failed. Please check your data and try again.');
    }
  };

  const handleDownload = () => {
    if (!generatedCoupon) return;
    const link = document.createElement('a');
    link.href = generatedCoupon.dataUrl;
    link.download = `coupon-${generatedCoupon.data.serialNumber}.png`;
    link.click();
  };

  const handleWhatsAppShare = () => {
    if (!generatedCoupon) return;
    const cleanPhone = generatedCoupon.data.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hi ${generatedCoupon.data.userName}! 🎁 Here is your exclusive coupon from ${generatedCoupon.data.businessName}.\n\n` +
      `Value: ${generatedCoupon.data.discountValue}\n` +
      `Serial: ${generatedCoupon.data.serialNumber}\n` +
      `Expiry: ${generatedCoupon.data.expiryDate}\n\n` +
      `Show this image at the counter to redeem!`
    );
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const resetForm = () => {
    setGeneratedCoupon(null);
    setStatus(GenerationStatus.IDLE);
    setFormData({
      userName: '',
      phone: '',
      email: '',
      businessName: 'Sprit N Soul',
      discountType: 'Customer Loyalty',
      discountValue: '20% DISCOUNT',
      expiryDate: getDefaultExpiry(),
    });
  };

  if (view === 'admin') {
    return <AdminPage onBack={() => setView('designer')} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center py-12 px-4">
      <header className="max-w-4xl w-full flex flex-col items-center mb-12">
        <div className="w-full flex justify-end items-center mb-6">
          <button 
            onClick={() => setView('admin')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-bold text-xs transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Administrative Portal
          </button>
        </div>
        <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-[2rem] mb-6 shadow-2xl shadow-slate-200">
          <Ticket className="text-white w-8 h-8" />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight text-center">
          Sprit N Soul <span className="text-blue-600">Studio</span>
        </h1>
        <p className="mt-4 text-slate-500 text-xl font-medium max-w-lg text-center leading-relaxed">
          Premium designer tool for sophisticated digital retail vouchers.
        </p>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
            <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
            <h2 className="text-2xl font-bold text-slate-900">Configure Campaign</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Recipient Name
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="e.g. Alexander Pierce"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building className="w-3 h-3" /> Brand Authority
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Contact Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Reference
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@studio.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Incentive Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer font-medium text-slate-700"
                >
                  <option>Holiday Special</option>
                  <option>Customer Loyalty</option>
                  <option>Flash Sale</option>
                  <option>Grand Opening</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Incentive Value</label>
                <input
                  type="text"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder="e.g. 50% OFF"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays className="w-3 h-3" /> Validity Period
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status !== GenerationStatus.IDLE && status !== GenerationStatus.ERROR && status !== GenerationStatus.SUCCESS}
              className="w-full py-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 mt-4 active:scale-95"
            >
              {status === GenerationStatus.PROCESSING || status === GenerationStatus.COMPOSITING ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Asset...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Digital Asset
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex-grow flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-900">
                <CheckCircle2 className={`w-6 h-6 ${status === GenerationStatus.SUCCESS ? 'text-emerald-500' : 'text-slate-200'}`} />
                <h2 className="text-2xl font-bold">Voucher Preview</h2>
              </div>
              {generatedCoupon && (
                <button 
                  onClick={resetForm}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2 border border-blue-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> New Design
                </button>
              )}
            </div>

            <div className="relative flex-grow min-h-[400px] w-full bg-[#FBFBFB] rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center group shadow-inner">
              {status === GenerationStatus.IDLE && (
                <div className="text-center px-10">
                  <div className="p-6 bg-white rounded-full inline-block mb-4 shadow-sm group-hover:scale-110 transition-transform duration-700">
                    <Ticket className="w-16 h-16 text-slate-100" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for configuration</p>
                </div>
              )}

              {(status === GenerationStatus.PROCESSING || status === GenerationStatus.COMPOSITING) && (
                <div className="text-center px-6 space-y-6">
                  <div className="relative">
                    <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                    <div className="absolute inset-0 bg-blue-400/5 rounded-full blur-2xl animate-pulse"></div>
                  </div>
                  <p className="text-slate-900 font-bold text-xl tracking-tight">Rendering Digital Masterpiece</p>
                  <div className="flex justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}

              {status === GenerationStatus.SUCCESS && generatedCoupon && (
                <img 
                  src={generatedCoupon.dataUrl} 
                  alt="Generated Coupon" 
                  className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000 shadow-2xl"
                />
              )}
              
              {status === GenerationStatus.ERROR && (
                <div className="text-center px-10 animate-in fade-in zoom-in duration-300">
                  <div className="p-6 bg-rose-50 rounded-full inline-block mb-4">
                    <AlertCircle className="w-16 h-16 text-rose-200" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generation Failed</p>
                </div>
              )}
            </div>

            {status === GenerationStatus.SUCCESS && (
              <div className="mt-10 grid grid-cols-2 gap-5 animate-in slide-in-from-bottom-6 duration-700">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-100 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  Save Archive
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-3 py-4 px-6 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                  Deploy WhatsApp
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-24 text-slate-300 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-4">
        <span className="h-[1px] w-12 bg-slate-100"></span>
        Sprit N Soul © 2025
        <span className="h-[1px] w-12 bg-slate-100"></span>
      </footer>
    </div>
  );
};

export default App;