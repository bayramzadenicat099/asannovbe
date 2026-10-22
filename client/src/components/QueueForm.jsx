import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ChevronRight, RefreshCw, CheckCircle, AlertCircle, User, Users, Info, FileText, Printer, XCircle, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const QueueForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceType: '',
    category: '', 
    subCategory: '', 
    age: '',
    finCode: '',
  });
  const [ticket, setTicket] = useState(null);
  const [rejection, setRejection] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/services`);
      // Manual add to ensure visibility even if not in DB
      const manualService = { name: 'Ümumivətəndaş Xarici Pasport' };
      const exists = res.data.some(s => s.name === manualService.name);
      if (!exists) {
        setServices([manualService, ...res.data]);
      } else {
        setServices(res.data);
      }
    } catch (err) {
      console.error(err);
      setServices([
        { name: 'Ümumivətəndaş Xarici Pasport' },
        { name: 'Məhkumluq arayışı' }
      ]);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const resetForm = () => {
    setStep(1);
    setTicket(null);
    setRejection(null);
    setFormData({
      serviceType: '',
      category: '',
      subCategory: '',
      age: '',
      finCode: '',
    });
  };

  const triggerRejection = (message) => {
    setRejection(message);
    setTimeout(() => {
      resetForm();
    }, 5000);
  };

  const handleSubmit = async () => {
    // Custom check for general services
    if (formData.serviceType !== 'Ümumivətəndaş Xarici Pasport') {
      if (formData.category.includes('Hazır sənəd') && formData.age && parseInt(formData.age) < 18) {
        triggerRejection('Yaş 18-dən az olduğu üçün növbə yaradıla bilməz.');
        return;
      }
    }

    if (!/^[A-Z0-9]{7}$/.test(formData.finCode.toUpperCase())) {
      toast.error('FİN kod formatı yanlışdır (7 simvol olmalıdır).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        serviceType: formData.serviceType,
        category: formData.category + (formData.subCategory ? ` (${formData.subCategory})` : ''),
        finCode: formData.finCode.toUpperCase(),
      };
      
      if (formData.age) {
        payload.age = formData.age;
      }

      const res = await axios.post(`${API_URL}/queue`, payload);
      setTicket(res.data);
      toast.success('Növbə uğurla yaradıldı!');
      
      setTimeout(() => {
        resetForm();
      }, 8000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (ticket) {
    return (
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 max-w-lg mx-auto px-4">
        <div className="asan-card w-full text-center border-t-8 border-asan-blue printable-ticket shadow-2xl">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 print:hidden" />
          <h2 className="text-3xl font-black mb-2 text-gray-900">TƏŞƏKKÜR EDİRİK!</h2>
          <p className="text-gray-500 font-medium mb-6">Növbə nömrəniz uğurla alındı</p>
          
          <div className="bg-gray-50 p-8 rounded-3xl mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-asan-blue/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="text-8xl font-black text-asan-blue tracking-tighter mb-2">
              {ticket.queueNumber}
            </div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Sizin Növbə</div>
          </div>

          <div className="text-left bg-white border border-gray-100 p-6 rounded-2xl space-y-4 text-sm print:border-gray-300">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-bold uppercase text-[10px]">Xidmət</span>
              <span className="font-bold text-gray-800">{ticket.serviceType}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-bold uppercase text-[10px]">Kateqoriya</span>
              <span className="font-bold text-gray-800">{ticket.category}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-bold uppercase text-[10px]">FİN Kod</span>
              <span className="font-mono font-bold text-asan-blue">{ticket.finCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold uppercase text-[10px]">Tarix</span>
              <span className="font-bold text-gray-600">{new Date(ticket.timestamp).toLocaleString('az-AZ')}</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 print:hidden">
            <button 
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl font-bold"
            >
              <Printer className="w-5 h-5" /> ÇEKİ ÇAP ET
            </button>
            <button 
              onClick={resetForm}
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-asan-blue transition-all font-bold text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              YENİ NÖVBƏ AL (8s)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (rejection) {
    return (
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 max-w-md mx-auto">
        <div className="asan-card w-full text-center border-t-8 border-red-500 shadow-2xl">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-2 text-gray-900">ÜZR İSTƏYİRİK</h2>
          <div className="text-lg text-red-600 font-bold my-8 bg-red-50 p-6 rounded-2xl border border-red-100">
            {rejection}
          </div>
          <button 
            onClick={resetForm}
            className="mt-4 flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition-all font-bold mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            ANA SƏHİFƏYƏ QAYIT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 print:hidden pb-20">
      <div className="flex justify-center mb-10 gap-2">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-asan-blue shadow-[0_0_10px_rgba(0,102,179,0.5)]' : 'bg-gray-200'}`}></div>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">XİDMƏTİ SEÇİN</h1>
              <p className="text-gray-500 font-medium">Zəhmət olmasa müraciət etmək istədiyiniz xidmət sahəsini seçin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, index) => (
                <button
                  key={s._id || index}
                  onClick={() => {
                    setFormData({ ...formData, serviceType: s.name });
                    handleNext();
                  }}
                  className="group relative p-8 text-left bg-white border-2 border-gray-50 rounded-3xl transition-all hover:border-asan-blue hover:shadow-2xl hover:shadow-asan-blue/10 flex flex-col h-64 justify-between overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-asan-blue/5 rounded-full transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-asan-blue transition-colors duration-500 shadow-inner">
                    <FileText className="text-asan-blue group-hover:text-white transition-colors" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-black text-xl text-gray-800 leading-tight mb-2 group-hover:text-asan-blue transition-colors">{s.name}</h3>
                    <div className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-widest group-hover:text-asan-blue/60">
                      Seçim et <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step >= 2 && formData.serviceType === 'Ümumivətəndaş Xarici Pasport' ? (
          <PassportFlow 
            step={step}
            setStep={setStep}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            triggerRejection={triggerRejection}
            loading={loading}
            onBack={handleBack}
          />
        ) : (
          <>
            {step === 2 && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-gray-900 uppercase">Müraciət Növü</h2>
                  <p className="text-gray-500 font-medium">Müraciətinizin məqsədini müəyyənləşdirin</p>
                </div>
                <div className="grid gap-6">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, category: 'İnformasiya' });
                      setStep(5);
                    }}
                    className="p-8 text-left bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all flex items-center gap-6 group shadow-lg hover:shadow-2xl hover:shadow-asan-blue/10"
                  >
                    <div className="bg-blue-50 p-5 rounded-2xl group-hover:bg-asan-blue transition-colors">
                      <Info className="w-8 h-8 text-asan-blue group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-gray-800">İnformasiya üçün</h3>
                      <p className="text-gray-500 font-medium">Xidmət haqqında ətraflı məlumat almaq</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setFormData({ ...formData, category: 'Hazır sənəd' });
                      handleNext();
                    }}
                    className="p-8 text-left bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all flex items-center gap-6 group shadow-lg hover:shadow-2xl hover:shadow-asan-blue/10"
                  >
                    <div className="bg-green-50 p-5 rounded-2xl group-hover:bg-green-600 transition-colors">
                      <CheckCircle className="w-8 h-8 text-green-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-gray-800">Hazır sənəd</h3>
                      <p className="text-gray-500 font-medium">Sənədinizi təhvil almaq</p>
                    </div>
                  </button>
                </div>
                <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 mx-auto font-bold hover:text-gray-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Geri qayıt
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-gray-900 uppercase">Kimin Üçün?</h2>
                  <p className="text-gray-500 font-medium">Müraciət kimin adınadır?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, subCategory: 'Özüm üçün' });
                      setStep(4);
                    }}
                    className="p-10 text-center bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all group shadow-lg hover:shadow-2xl hover:shadow-asan-blue/10"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-asan-blue transition-colors shadow-inner">
                      <User className="w-10 h-10 text-gray-400 group-hover:text-white" />
                    </div>
                    <h3 className="font-black text-2xl text-gray-800">Özüm üçün</h3>
                  </button>
                  <button
                    onClick={() => {
                      setFormData({ ...formData, subCategory: 'Digər şəxs üçün' });
                      setStep(4);
                    }}
                    className="p-10 text-center bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all group shadow-lg hover:shadow-2xl hover:shadow-asan-blue/10"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-asan-blue transition-colors shadow-inner">
                      <Users className="w-10 h-10 text-gray-400 group-hover:text-white" />
                    </div>
                    <h3 className="font-black text-2xl text-gray-800">Digər şəxs üçün</h3>
                  </button>
                </div>
                <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 mx-auto font-bold hover:text-gray-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Geri qayıt
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="max-w-xl mx-auto">
                {formData.subCategory === 'Özüm üçün' ? (
                  <SelfLogic 
                    onNext={() => setStep(5)} 
                    onReject={() => triggerRejection('Zəhmət olmasa şəxsiyyət vəsiqəsinin əsli ilə yaxınlaşın.')} 
                    onBack={handleBack} 
                  />
                ) : (
                  <OtherLogic 
                    onNext={() => setStep(5)} 
                    onReject={() => triggerRejection('Tələb olunan sənədlərlə (Etibarnamə və Ş.V.) yaxınlaşın.')} 
                    onBack={handleBack} 
                  />
                )}
              </div>
            )}

            {step === 5 && (
               <AgeAndFin 
                category={formData.category}
                subCategory={formData.subCategory}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                triggerRejection={triggerRejection}
                loading={loading}
                onBack={() => {
                  if (formData.category === 'İnformasiya') setStep(2);
                  else setStep(4);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SelfLogic = ({ onNext, onReject, onBack }) => {
  const [askMyGov, setAskMyGov] = useState(false);

  if (!askMyGov) {
    return (
      <div className="asan-card space-y-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center">
          <FileText className="w-10 h-10 text-asan-blue" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 leading-tight">Şəxsiyyət vəsiqəsinin əsli yanınızdadırmı?</h2>
        <div className="flex flex-col gap-4">
          <button onClick={onNext} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-xl shadow-green-200">BƏLİ, YANIMDADIR</button>
          <button onClick={() => setAskMyGov(true)} className="w-full py-5 bg-gray-100 text-gray-500 rounded-2xl font-black text-xl hover:bg-gray-200 transition-all">XEYR, YOXDUR</button>
        </div>
        <button onClick={onBack} className="text-gray-400 font-bold hover:text-gray-600 transition-colors">Geri</button>
      </div>
    );
  }

  return (
    <div className="asan-card space-y-8 text-center shadow-2xl animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="w-20 h-20 bg-asan-blue rounded-full mx-auto flex items-center justify-center">
        <span className="text-white font-black text-2xl">my</span>
      </div>
      <h2 className="text-3xl font-black text-gray-900 leading-tight">myGov tətbiqində rəqəmsal vəsiqəniz varmı?</h2>
      <div className="flex flex-col gap-4">
        <button onClick={onNext} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-xl shadow-green-200">BƏLİ, VAR</button>
        <button onClick={onReject} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xl hover:bg-red-600 transition-all shadow-xl shadow-red-200">XEYR, YOXDUR</button>
      </div>
      <button onClick={() => setAskMyGov(false)} className="text-gray-400 font-bold hover:text-gray-600 transition-colors">Geri</button>
    </div>
  );
};

const OtherLogic = ({ onNext, onReject, onBack }) => {
  const [hasPoA, setHasPoA] = useState(null);

  if (hasPoA === null) {
    return (
      <div className="asan-card space-y-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center">
          <FileText className="w-10 h-10 text-asan-blue" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 leading-tight">Notarial qaydada təsdiq olunmuş Etibarnamə varmı?</h2>
        <div className="flex flex-col gap-4">
          <button onClick={() => setHasPoA(true)} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-xl shadow-green-200">BƏLİ, VAR</button>
          <button onClick={onReject} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xl hover:bg-red-600 transition-all shadow-xl shadow-red-200">XEYR, YOXDUR</button>
        </div>
        <button onClick={onBack} className="text-gray-400 font-bold hover:text-gray-600 transition-colors">Geri</button>
      </div>
    );
  }

  return (
    <div className="asan-card space-y-8 text-center shadow-2xl animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center">
        <User className="w-10 h-10 text-asan-blue" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 leading-tight">Öz şəxsiyyət vəsiqəniz yanınızdadırmı?</h2>
      <div className="flex flex-col gap-4">
        <button onClick={onNext} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-xl shadow-green-200">BƏLİ, YANIMDADIR</button>
        <button onClick={onReject} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xl hover:bg-red-600 transition-all shadow-xl shadow-red-200">XEYR, YOXDUR</button>
      </div>
      <button onClick={() => setHasPoA(null)} className="text-gray-400 font-bold hover:text-gray-600 transition-colors">Geri</button>
    </div>
  );
};

const PassportFlow = ({ step, setStep, formData, setFormData, handleSubmit, triggerRejection, loading, onBack }) => {
  const [passportStep, setPassportStep] = useState(1);
  const [gender, setGender] = useState(''); 
  
  useEffect(() => {
    if (step === 1) setPassportStep(1);
  }, [step]);

  const nextP = () => setPassportStep(prev => prev + 1);
  const backP = () => {
    if (passportStep === 5) {
      if (formData.category === 'Hazır sənəd') setPassportStep(4);
      else if (formData.category === 'Sənəd qəbulu') setPassportStep(3);
      else setPassportStep(1);
    } else if (passportStep === 4) {
      setPassportStep(1);
    } else {
      setPassportStep(prev => prev - 1);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500">
      {passportStep === 1 && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 uppercase">MÜRACİƏT NÖVÜ</h2>
            <p className="text-gray-500 font-medium">Zəhmət olmasa müraciət növünü seçin</p>
          </div>
          <div className="grid gap-6">
            <button
              onClick={() => {
                setFormData({ ...formData, category: 'İnformasiya' });
                setPassportStep(5);
              }}
              className="p-8 text-left bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all flex items-center gap-6 group shadow-lg"
            >
              <div className="bg-blue-50 p-5 rounded-2xl group-hover:bg-asan-blue transition-colors">
                <Info className="w-8 h-8 text-asan-blue group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-gray-800">İnformasiya üçün</h3>
                <p className="text-gray-500 font-medium">Xidmət haqqında ətraflı məlumat almaq</p>
              </div>
            </button>
            <button
              onClick={() => {
                setFormData({ ...formData, category: 'Sənəd qəbulu' });
                nextP();
              }}
              className="p-8 text-left bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all flex items-center gap-6 group shadow-lg"
            >
              <div className="bg-purple-50 p-5 rounded-2xl group-hover:bg-purple-600 transition-colors">
                <FileText className="w-8 h-8 text-purple-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-gray-800">Sənəd qəbulu</h3>
                <p className="text-gray-500 font-medium">Yeni pasport üçün sənəd qəbulu</p>
              </div>
            </button>
            <button
              onClick={() => {
                setFormData({ ...formData, category: 'Hazır sənəd' });
                setPassportStep(4);
              }}
              className="p-8 text-left bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all flex items-center gap-6 group shadow-lg"
            >
              <div className="bg-green-50 p-5 rounded-2xl group-hover:bg-green-600 transition-colors">
                <CheckCircle className="w-8 h-8 text-green-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-gray-800">Hazır sənəd</h3>
                <p className="text-gray-500 font-medium">Hazır sənədin təhvil alınması</p>
              </div>
            </button>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 mx-auto font-bold hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Geri qayıt
          </button>
        </div>
      )}

      {passportStep === 2 && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 uppercase">Kimin Üçün?</h2>
            <p className="text-gray-500 font-medium">Müraciət kimin adınadır?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setFormData({ ...formData, subCategory: 'Özünüz üçün' });
                nextP();
              }}
              className="p-10 text-center bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all group shadow-lg"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-asan-blue transition-colors">
                <User className="w-10 h-10 text-gray-400 group-hover:text-white" />
              </div>
              <h3 className="font-black text-2xl text-gray-800">Özünüz üçün</h3>
            </button>
            <button
              onClick={() => {
                setFormData({ ...formData, subCategory: 'Övladınız üçün' });
                nextP();
              }}
              className="p-10 text-center bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all group shadow-lg"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-asan-blue transition-colors">
                <Users className="w-10 h-10 text-gray-400 group-hover:text-white" />
              </div>
              <h3 className="font-black text-2xl text-gray-800">Övladınız üçün</h3>
            </button>
          </div>
          <button onClick={backP} className="flex items-center gap-2 text-gray-400 mx-auto font-bold hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Geri
          </button>
        </div>
      )}

      {passportStep === 3 && (
        <PassportAgeSelection 
          formData={formData}
          setFormData={setFormData}
          gender={gender}
          setGender={setGender}
          onNext={() => setPassportStep(5)}
          onBack={backP}
          triggerRejection={triggerRejection}
        />
      )}

      {passportStep === 4 && (
        <div className="asan-card space-y-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center">
            <User className="w-10 h-10 text-asan-blue" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">Yaşınız 15-dən yuxarıdır?</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setFormData({ ...formData, age: '15+' });
                setPassportStep(5);
              }}
              className="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 shadow-xl"
            >
              BƏLİ
            </button>
            <button 
              onClick={() => triggerRejection('Hazır sənəd üçün yaş 15+ olmalıdır.')}
              className="flex-1 py-5 bg-red-50 text-red-500 rounded-2xl font-black text-xl hover:bg-red-100 border-2 border-red-100"
            >
              XEYR
            </button>
          </div>
          <button onClick={backP} className="text-gray-400 font-bold hover:text-gray-600 transition-colors">Geri</button>
        </div>
      )}

      {passportStep === 5 && (
        <AgeAndFin 
          category={formData.category}
          subCategory={formData.subCategory}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          triggerRejection={triggerRejection}
          loading={loading}
          onBack={backP}
        />
      )}
    </div>
  );
};

const PassportAgeSelection = ({ formData, setFormData, gender, setGender, onNext, onBack, triggerRejection }) => {
  const [selectedRange, setSelectedRange] = useState('');
  const [qStep, setQStep] = useState(1);
  
  const ageRanges = [
    { label: '1 - 15 yaş', value: '1-15' },
    { label: '15 - 18 yaş', value: '15-18' },
    { label: '18 - 30 yaş', value: '18-30' },
    { label: '30+ yaş', value: '30+' }
  ].filter(r => {
    if (formData.subCategory === 'Övladınız üçün') return r.value === '1-15' || r.value === '15-18';
    return true;
  });

  const handleReject = (msg) => {
    triggerRejection(msg);
  };

  const renderQuestion = (text, onYes, onNo) => (
    <div className="asan-card space-y-10 text-center animate-in zoom-in duration-300 shadow-2xl">
      <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center">
        <Info className="w-10 h-10 text-asan-blue" />
      </div>
      <h3 className="text-3xl font-black text-gray-900 leading-tight">{text}</h3>
      <div className="flex gap-4">
        <button onClick={onYes} className="flex-1 py-6 bg-green-600 text-white rounded-3xl font-black text-2xl hover:bg-green-700 shadow-xl shadow-green-200">BƏLİ</button>
        <button onClick={onNo} className="flex-1 py-6 bg-red-50 text-red-500 rounded-3xl font-black text-2xl hover:bg-red-100 border-2 border-red-100">XEYR</button>
      </div>
      <button onClick={() => { setQStep(1); setSelectedRange(''); setGender(''); }} className="text-gray-400 font-bold hover:text-gray-600 uppercase tracking-widest text-sm">Geri qayıt</button>
    </div>
  );

  const renderFlow = () => {
    if (selectedRange === '1-15') {
      if (qStep === 1) return renderQuestion("Valideynlərinizin hər ikisi də yanınızdadırmı?", () => setQStep(3), () => setQStep(2));
      if (qStep === 2) return renderQuestion("Valideynlərdən birinin iştirakı və digərinin notarial qaydada təsdiq olunmuş razılıq ərizəsi varmı?", () => setQStep(3), () => handleReject("Valideynlərin iştirakı və ya notarial qaydada təsdiq olunmuş razılıq ərizəsi mütləqdir."));
      if (qStep === 3) return renderQuestion("Valideynlərin və uşağın şəxsiyyət vəsiqələri yanınızdadırmı?", onNext, () => handleReject("Şəxsiyyət vəsiqələri mütləqdir."));
    }

    if (selectedRange === '15-18') {
      if (!gender) return (
        <div className="asan-card space-y-8 text-center animate-in zoom-in duration-300">
          <h3 className="text-2xl font-black text-gray-900 uppercase">CİNSİYYƏTİ SEÇİN</h3>
          <div className="flex gap-4">
            <button onClick={() => setGender('Kişi')} className="flex-1 py-5 bg-blue-50 text-blue-600 rounded-2xl font-black text-xl hover:bg-blue-100 transition-all">KİŞİ</button>
            <button onClick={() => setGender('Qadın')} className="flex-1 py-5 bg-pink-50 text-pink-600 rounded-2xl font-black text-xl hover:bg-pink-100 transition-all">QADIN</button>
          </div>
          <button onClick={() => setSelectedRange('')} className="text-gray-400 font-bold hover:text-gray-600 uppercase tracking-widest text-sm">Geri</button>
        </div>
      );
      if (qStep === 1) return renderQuestion("Valideynlərinizin hər ikisi də yanınızdadırmı?", () => setQStep(3), () => setQStep(2));
      if (qStep === 2) return renderQuestion("Valideynlərdən birinin iştirakı və digərinin notarial qaydada təsdiq olunmuş razılıq ərizəsi varmı?", () => setQStep(3), () => handleReject("Valideynlərin iştirakı və ya notarial qaydada təsdiq olunmuş razılıq ərizəsi mütləqdir."));
      if (qStep === 3) return renderQuestion("Şəxsiyyət vəsiqələri yanınızdadırmı?", () => gender === 'Kişi' ? setQStep(4) : onNext(), () => handleReject("Şəxsiyyət vəsiqələri mütləqdir."));
      if (qStep === 4) return renderQuestion("Ağ bilet yanınızdadırmı?", onNext, () => handleReject("Ağ bilet mütləqdir."));
    }

    if (selectedRange === '18-30') {
      if (qStep === 1) return renderQuestion("Hərbi biletiniz (və ya ağ bilet) yanınızdadırmı?", () => setQStep(2), () => handleReject("Hərbi bilet və ya ağ bilet mütləqdir."));
      if (qStep === 2) return renderQuestion("Şəxsiyyət vəsiqəniz yanınızdadırmı?", onNext, () => handleReject("Şəxsiyyət vəsiqəsi mütləqdir."));
    }

    if (selectedRange === '30+') {
      if (qStep === 1) return renderQuestion("Şəxsiyyət vəsiqəniz yanınızdadırmı?", onNext, () => handleReject("Şəxsiyyət vəsiqəsi mütləqdir."));
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {!selectedRange && (
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Yaş Paneli</h2>
            <p className="text-gray-500 font-medium">Müraciət edən şəxsin yaş qrupunu seçin</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ageRanges.map(range => (
              <button
                key={range.value}
                onClick={() => { setSelectedRange(range.value); setFormData({...formData, age: range.value}); }}
                className="p-8 bg-white border-2 border-gray-50 rounded-3xl hover:border-asan-blue transition-all font-black text-xl shadow-md hover:shadow-2xl hover:shadow-asan-blue/10 active:scale-95"
              >
                {range.label}
              </button>
            ))}
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 mx-auto font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-sm">
            <ArrowLeft className="w-4 h-4" /> Geri qayıt
          </button>
        </div>
      )}
      
      {selectedRange && renderFlow()}
    </div>
  );
};

const AgeAndFin = ({ category, subCategory, formData, setFormData, onSubmit, triggerRejection, loading, onBack }) => {
  const [fin, setFin] = useState(formData.finCode);
  const [age, setAge] = useState(formData.age);
  
  const isHazirSened = category === 'Hazır sənəd';
  const isOtherPerson = subCategory === 'Digər şəxs üçün';
  // Standard logic for other services, skipped for passport as it has its own age panel
  const showAgeSelection = isHazirSened && isOtherPerson && formData.serviceType !== 'Ümumivətəndaş Xarici Pasport';

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-black text-gray-900 uppercase">Məlumatları Tamamlayın</h2>
        <p className="text-gray-500 font-medium">Növbəni təsdiqləmək üçün son addım</p>
      </div>

      <div className="asan-card space-y-10 shadow-2xl">
        {showAgeSelection && (
          <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-10">
            <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center">
              <User className="w-10 h-10 text-asan-blue" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Müraciət edən şəxsin yaşı 18-dən yuxarıdır?</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setAge('18+'); 
                  setFormData({ ...formData, age: '18+' });
                }}
                className={`flex-1 py-5 rounded-2xl font-black text-xl transition-all ${age === '18+' ? 'bg-green-600 text-white shadow-xl' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              >
                BƏLİ
              </button>
              <button 
                onClick={() => {
                  setAge('<18'); 
                  setFormData({ ...formData, age: '<18' });
                  triggerRejection('Yaş 18-dən az olduğu üçün növbə yaradıla bilməz.');
                }}
                className="flex-1 py-5 bg-red-50 text-red-500 rounded-2xl font-black text-xl hover:bg-red-100 transition-all border-2 border-red-100"
              >
                XEYR
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <label className="block text-center text-sm font-black text-gray-400 uppercase tracking-widest">FİN Kod (7 simvol)</label>
          <div className="relative">
            <input 
              type="text" 
              value={fin}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (val.length <= 7) {
                  setFin(val);
                  setFormData({ ...formData, finCode: val });
                }
              }}
              placeholder="7ABC123"
              className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-asan-blue transition-all text-center text-4xl font-black font-mono tracking-[0.5em] text-asan-blue uppercase placeholder:opacity-20 shadow-inner"
            />
          </div>
          <div className="flex justify-center gap-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
              <Info className="w-3 h-3" /> FİN kod mütləq 7 simvol olmalıdır
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onSubmit}
            disabled={loading || fin.length < 7 || (showAgeSelection && !age)}
            className="w-full py-6 bg-asan-blue text-white rounded-3xl font-black text-2xl hover:bg-blue-700 transition-all disabled:bg-gray-200 disabled:text-gray-400 shadow-2xl shadow-asan-blue/30 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" /> GÖZLƏYİN...
              </div>
            ) : 'NÖVBƏNİ TƏSDİQLƏ'}
          </button>
          <button onClick={onBack} className="text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase text-sm tracking-widest">Geri qayıt</button>
        </div>
      </div>
    </div>
  );
};

export default QueueForm;
