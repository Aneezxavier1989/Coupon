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
    businessName: 'Spirit N Soul',
    discountType: 'Customer Loyalty',
    discountValue: '20% DISCOUNT',
    expiryDate: getDefaultExpiry(),
  });

  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [generatedCoupon, setGeneratedCoupon] = useState<GeneratedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSerial = () => {
    return 'SN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
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
      setError('Local storage is full. Please clear some old records.');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.phone || !formData.businessName || !formData.expiryDate) {
      setError("Please ensure all required fields, including Phone Number, are completed.");
      return;
    }

    setStatus(GenerationStatus.PROCESSING);
    setError(null);

    await new Promise(r => setTimeout(r, 1000));

    try {
      const backgroundUrl = await generateBackground(formData.discountType);
      setStatus(GenerationStatus.COMPOSITING);
      
      const fullData: CouponData = {
        ...formData,
        serialNumber: generateSerial(),
        expiryDate: new Date(formData.expiryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      };

      const finalImage = await compositeCoupon(backgroundUrl, fullData);
      const newCoupon = { dataUrl: finalImage, data: fullData };

      setGeneratedCoupon(newCoupon);
      saveToStorage(newCoupon);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(GenerationStatus.ERROR);
      setError('Design generation failed. Please check your inputs.');
    }
  };

  const handleDownload = () => {
    if (!generatedCoupon) return;
    const link = document.createElement('a');
    link.href = generatedCoupon.dataUrl;
    link.download = `sn-voucher-${generatedCoupon.data.serialNumber}.png`;
    link.click();
  };

  const handleWhatsAppShare = () => {
    if (!generatedCoupon) return;
    const cleanPhone = generatedCoupon.data.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `✨ Hello ${generatedCoupon.data.userName}! Your exclusive voucher from Spirit N Soul is ready.\n\n` +
      `🎁 Benefit: ${generatedCoupon.data.discountValue}\n` +
      `🆔 ID: ${generatedCoupon.data.serialNumber}\n` +
      `📅 Valid Until: ${generatedCoupon.data.expiryDate}\n\n` +
      `Redeem at our Salon and Boutique!`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const resetForm = () => {
    setGeneratedCoupon(null);
    setStatus(GenerationStatus.IDLE);
    setFormData({
      userName: '',
      phone: '',
      email: '',
      businessName: 'Spirit N Soul',
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
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-[#B68D40] text-slate-700 hover:text-[#B68D40] rounded-2xl font-bold text-xs transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" /> Management Portal
          </button>
        </div>
        
        <div className="text-center pt-8">
          <h1 className="text-6xl font-extrabold text-[#1e293b] tracking-tight">
            Spirit N Soul
          </h1>
          <p className="text-[#B68D40] text-xl font-bold tracking-[0.5em] uppercase mt-4">
            Salon and Boutique
          </p>
        </div>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
            <Zap className="w-5 h-5 text-[#B68D40] fill-[#B68D40]" />
            <h2 className="text-2xl font-bold text-slate-900">Campaign Details</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3 text-[#B68D40]" /> Recipient Name
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="Alexander Pierce"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#B68D40] outline-none font-medium text-slate-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building className="w-3 h-3 text-[#B68D40]" /> Business Entity
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#B68D40]" /> Phone Number (Required)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#B68D40] outline-none font-medium text-slate-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3 text-[#B68D40]" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="client@domain.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#B68D40] outline-none font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#B68D40] uppercase tracking-widest">Category</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#B68D40] outline-none font-medium text-slate-700"
                >
                  <option>Holiday Special</option>
                  <option>Customer Loyalty</option>
                  <option>Flash Sale</option>
                  <option>Grand Opening</option>
                  <option>Bridal Package</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#B68D40] uppercase tracking-widest">Promotion Value</label>
                <input
                  type="text"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder="50% DISCOUNT"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#B68D40] outline-none font-bold text-[#B68D40]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays className="w-3 h-3 text-[#B68D40]" /> Expiration Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#B68D40] outline-none font-medium text-slate-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === GenerationStatus.PROCESSING || status === GenerationStatus.COMPOSITING}
              className="w-full py-5 bg-[#1e293b] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 mt-4 active:scale-95"
            >
              {status === GenerationStatus.PROCESSING || status === GenerationStatus.COMPOSITING ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#B68D40]" />
                  Generating Masterpiece...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-[#B68D40]" />
                  Design Voucher
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex-grow flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-900">
                <CheckCircle2 className={`w-6 h-6 ${status === GenerationStatus.SUCCESS ? 'text-emerald-500' : 'text-slate-200'}`} />
                <h2 className="text-2xl font-bold">Voucher Canvas</h2>
              </div>
              {generatedCoupon && (
                <button 
                  onClick={resetForm}
                  className="px-4 py-2 bg-[#B68D40]/10 text-[#B68D40] rounded-xl text-xs font-bold hover:bg-[#B68D40]/20 transition-colors flex items-center gap-2 border border-[#B68D40]/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> New Design
                </button>
              )}
            </div>

            <div className="relative flex-grow min-h-[400px] w-full bg-[#FBFBFB] rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center group shadow-inner">
              {status === GenerationStatus.IDLE && (
                <div className="text-center px-10">
                  <div className="p-6 bg-white rounded-full inline-block mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <Ticket className="w-16 h-16 text-slate-100" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Enter campaign details to preview</p>
                </div>
              )}

              {(status === GenerationStatus.PROCESSING || status === GenerationStatus.COMPOSITING) && (
                <div className="text-center px-6 space-y-4">
                  <div className="relative inline-block">
                    <RefreshCw className="w-12 h-12 text-[#B68D40] animate-spin mx-auto" />
                    <div className="absolute inset-0 bg-[#B68D40]/10 blur-xl animate-pulse rounded-full"></div>
                  </div>
                  <p className="text-[#1e293b] font-bold text-lg tracking-tight">Compositing Luxury Asset</p>
                </div>
              )}

              {status === GenerationStatus.SUCCESS && generatedCoupon && (
                <img 
                  src={generatedCoupon.dataUrl} 
                  alt="Spirit N Soul Voucher" 
                  className="w-full h-full object-cover animate-in fade-in zoom-in duration-700 shadow-2xl"
                />
              )}
            </div>

            {status === GenerationStatus.SUCCESS && (
              <div className="mt-10 grid grid-cols-2 gap-5 animate-in slide-in-from-bottom-6 duration-700">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-3 py-4 px-6 bg-[#1e293b] hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-100 active:scale-95"
                >
                  <Download className="w-5 h-5 text-[#B68D40]" />
                  Save PNG
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-3 py-4 px-6 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                  Share via WhatsApp
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-20 text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em] flex items-center gap-6">
        <span className="h-[1px] w-16 bg-slate-100"></span>
        Spirit N Soul Salon and Boutique © 2026
        <span className="h-[1px] w-16 bg-slate-100"></span>
      </footer>
    </div>
  );
};

export default App;