
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Search, 
  Download, 
  Clock, 
  User, 
  Tag,
  Phone,
  RefreshCw,
  Share2,
  Database,
  Github,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';

interface AdminPageProps {
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncGuide, setShowSyncGuide] = useState(false);

  const loadCoupons = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const data = localStorage.getItem('ai_coupons');
      if (data) {
        setCoupons(JSON.parse(data));
      } else {
        setCoupons([]);
      }
      setIsSyncing(false);
    }, 400);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleDelete = (id: string) => {
    const updated = coupons.filter(c => c.data.serialNumber !== id);
    setCoupons(updated);
    localStorage.setItem('ai_coupons', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm('Permanently delete all coupon records?')) {
      setCoupons([]);
      localStorage.removeItem('ai_coupons');
    }
  };

  const handleReshare = (coupon: any) => {
    const cleanPhone = coupon.data.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Resending your coupon from ${coupon.data.businessName}!\n` +
      `Value: ${coupon.data.discountValue}\n` +
      `Serial: ${coupon.data.serialNumber}`
    );
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const filteredCoupons = coupons.filter(c => 
    c.data.userName.toLowerCase().includes(search.toLowerCase()) ||
    c.data.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.data.serialNumber.toLowerCase().includes(search.toLowerCase())
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Archive & Management</h1>
              <p className="text-slate-500 font-medium">Monitoring Sprit N Soul digital assets</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setShowSyncGuide(!showSyncGuide)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                showSyncGuide ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Github className="w-4 h-4" />
              Sync Status
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search database..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={handleClearAll}
              className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 border border-slate-200 hover:border-red-100"
            >
              <Trash2 className="w-4 h-4" /> Reset Data
            </button>
          </div>
        </header>

        {showSyncGuide && (
          <div className="mb-10 p-6 bg-blue-50 border border-blue-100 rounded-3xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                <Info className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-blue-900 mb-1">GitHub Sync Pre-settings</h3>
                <p className="text-blue-700 text-sm mb-4">Ensure your environment is correctly connected to GitHub to save changes permanently.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Repo Permissions', desc: 'Verify Read/Write access' },
                    { label: 'All Repositories', desc: 'Select "All" in GitHub settings' },
                    { label: 'Cookies Enabled', desc: 'Whitelist github.com' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-blue-100">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-xs font-bold text-blue-900 leading-none">{item.label}</p>
                        <p className="text-[10px] text-blue-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowSyncGuide(false)} className="text-blue-400 hover:text-blue-600">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-24 text-center border border-slate-100 shadow-sm">
            <div className="p-6 bg-slate-50 rounded-full inline-block mb-6">
              <Database className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No Records Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">The archive is currently empty. Start by designing a new coupon for your customers.</p>
            <button onClick={onBack} className="mt-8 px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
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
                    alt="Coupon" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/70 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[3px]">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleReshare(coupon)}
                        className="p-4 bg-emerald-500 text-white rounded-full hover:scale-110 transition-all shadow-2xl active:scale-90"
                        title="Resend WhatsApp"
                      >
                        <Share2 className="w-6 h-6" />
                      </button>
                      <a 
                        href={coupon.dataUrl} 
                        download={`coupon-${coupon.data.serialNumber}.png`}
                        className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 transition-all shadow-2xl active:scale-90"
                        title="Download"
                      >
                        <Download className="w-6 h-6" />
                      </a>
                      <button 
                        onClick={() => handleDelete(coupon.data.serialNumber)}
                        className="p-4 bg-rose-600 text-white rounded-full hover:scale-110 transition-all shadow-2xl active:scale-90"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-7">
                  <div className="flex justify-between items-start mb-5">
                    <h4 className="font-bold text-xl text-slate-900 line-clamp-1">{coupon.data.businessName}</h4>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg tracking-wider">
                      #{coupon.data.serialNumber.split('-')[1]}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</p>
                        <p className="text-sm font-bold text-slate-700">{coupon.data.userName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Benefit</p>
                        <p className="text-sm font-bold text-slate-700">{coupon.data.discountValue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(coupon.createdAt).toLocaleDateString()}
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
