import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Search, 
  Download, 
  Clock, 
  User, 
  Tag,
  Share2,
  Database,
  AlertCircle,
  X,
  FileSpreadsheet,
  Phone
} from 'lucide-react';
import { GeneratedCoupon } from './types';

interface AdminPageProps {
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const [coupons, setCoupons] = useState<GeneratedCoupon[]>([]);
  const [search, setSearch] = useState('');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const BRAND_GOLD = '#B68D40';

  const loadCoupons = () => {
    const data = localStorage.getItem('ai_coupons');
    if (data) {
      try {
        setCoupons(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse coupons", e);
        setCoupons([]);
      }
    } else {
      setCoupons([]);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleDelete = (serialNumber: string) => {
    const updated = coupons.filter(c => c.data.serialNumber !== serialNumber);
    setCoupons(updated);
    localStorage.setItem('ai_coupons', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setCoupons([]);
    localStorage.removeItem('ai_coupons');
    setIsConfirmingReset(false);
  };

  const handleExportExcel = () => {
    if (coupons.length === 0) return;
    
    // Create CSV content (Excel compatible)
    const headers = ['Serial Number', 'Created At', 'Recipient Name', 'Phone', 'Email', 'Promotion Type', 'Benefit Value', 'Expiry Date'];
    const rows = coupons.map(c => [
      c.data.serialNumber,
      // @ts-ignore
      c.createdAt ? new Date(c.createdAt).toLocaleString() : 'N/A',
      c.data.userName,
      c.data.phone,
      c.data.email || 'N/A',
      c.data.discountType,
      c.data.discountValue,
      c.data.expiryDate
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sprit_n_soul_vouchers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReshare = (coupon: GeneratedCoupon) => {
    const cleanPhone = coupon.data.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Resending your voucher from Sprit N Soul Salon and Boutique!\n` +
      `Value: ${coupon.data.discountValue}\n` +
      `Voucher ID: ${coupon.data.serialNumber}`
    );
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const filteredCoupons = coupons.filter(c => 
    c.data.userName.toLowerCase().includes(search.toLowerCase()) ||
    c.data.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.data.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.data.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <button 
              onClick={onBack}
              className="p-3 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-full transition-all active:scale-90"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Voucher Archive</h1>
              <p className="text-slate-500 font-medium">Managing Sprit N Soul digital assets</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#B68D40] transition-colors" />
              <input 
                type="text" 
                placeholder="Search database..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B68D40] outline-none transition-all shadow-sm"
              />
            </div>
            
            <button 
              onClick={handleExportExcel}
              disabled={coupons.length === 0}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-600 disabled:text-slate-300 disabled:bg-slate-50 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 border border-slate-200 hover:border-emerald-100 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download Excel
            </button>

            {isConfirmingReset ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <button 
                  onClick={handleClearAll}
                  className="px-4 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-100 flex items-center gap-2 hover:bg-rose-700 active:scale-95"
                >
                  Confirm Reset
                </button>
                <button 
                  onClick={() => setIsConfirmingReset(false)}
                  className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsConfirmingReset(true)}
                className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 border border-slate-200 hover:border-rose-100 shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Reset Records
              </button>
            )}
          </div>
        </header>

        {filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-24 text-center border border-slate-100 shadow-sm">
            <div className="p-6 bg-slate-50 rounded-full inline-block mb-6">
              <Database className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Archive Empty</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">No vouchers have been generated yet. Go back to create your first salon voucher.</p>
            <button onClick={onBack} className="mt-8 px-8 py-3.5 bg-[#1e293b] text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
              Launch Designer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCoupons.map((coupon) => (
              <div key={coupon.data.serialNumber} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 group hover:-translate-y-2">
                <div className="relative aspect-[16/9]">
                  <img 
                    src={coupon.dataUrl} 
                    alt="Voucher" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/80 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[3px]">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleReshare(coupon)}
                        className="p-4 bg-emerald-500 text-white rounded-full hover:scale-110 transition-all shadow-2xl active:scale-90"
                        title="Resend via WhatsApp"
                      >
                        <Share2 className="w-6 h-6" />
                      </button>
                      <a 
                        href={coupon.dataUrl} 
                        download={`sn-voucher-${coupon.data.serialNumber}.png`}
                        className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 transition-all shadow-2xl active:scale-90"
                        title="Download Image"
                      >
                        <Download className="w-6 h-6" />
                      </a>
                      <button 
                        onClick={() => handleDelete(coupon.data.serialNumber)}
                        className="p-4 bg-rose-600 text-white rounded-full hover:scale-110 transition-all shadow-2xl active:scale-90"
                        title="Remove Record"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-7">
                  <div className="flex justify-between items-start mb-5">
                    <h4 className="font-bold text-xl text-slate-900 line-clamp-1">Voucher ID</h4>
                    <span className="text-[10px] font-extrabold bg-[#B68D40]/10 text-[#B68D40] px-2.5 py-1.5 rounded-lg tracking-wider">
                      {coupon.data.serialNumber}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#B68D40]/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#B68D40]" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</p>
                        <p className="text-sm font-bold text-slate-700">{coupon.data.userName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                        <p className="text-sm font-bold text-slate-700">{coupon.data.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Promotion</p>
                        <p className="text-sm font-bold text-slate-700">{coupon.data.discountValue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                      <Clock className="w-3.5 h-3.5" />
                      {/* @ts-ignore */}
                      {coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString() : 'Today'}
                    </div>
                    <div className="text-[11px] font-bold text-rose-400 uppercase tracking-tight flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Expires {coupon.data.expiryDate}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;