import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogOut, Plus, Filter, Check, X, Users, CheckCircle, XCircle, Trash2, Database, LayoutDashboard, History, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [logQueues, setLogQueues] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ totalToday: 0, completedToday: 0, cancelledToday: 0 });
  const [newServiceName, setNewServiceName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'logs', 'services'
  
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('asan_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
    
    // Auto refresh every 10 seconds for real-time monitoring
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [filterStatus, filterDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [qRes, lRes, sRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/queue?status=${filterStatus}&date=${filterDate}`, { headers }),
        axios.get(`http://localhost:5000/api/queue?date=${filterDate}`, { headers }), // All for logs
        axios.get('http://localhost:5000/api/services', { headers }),
        axios.get(`http://localhost:5000/api/queue/stats?date=${filterDate}`, { headers })
      ]);
      setQueues(Array.isArray(qRes.data) ? qRes.data : []);
      setLogQueues(Array.isArray(lRes.data) ? lRes.data : []);
      setServices(Array.isArray(sRes.data) ? sRes.data : []);
      setStats(statsRes.data || { totalToday: 0, completedToday: 0, cancelledToday: 0 });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('asan_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/queue/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(status === 'cancelled' ? 'Növbə ləğv edildi' : 'Status yeniləndi');
      fetchData();
    } catch (err) {
      toast.error('Xəta baş verdi');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName) return;
    try {
      await axios.post('http://localhost:5000/api/services', { name: newServiceName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Yeni xidmət əlavə edildi');
      setNewServiceName('');
      fetchData();
    } catch (err) {
      toast.error('Xəta baş verdi');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Bu xidməti silmək istədiyinizə əminsiniz?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xidmət silindi');
      fetchData();
    } catch (err) {
      toast.error('Xəta baş verdi');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('asan_token');
    navigate('/admin/login');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Panel</h1>
          <p className="text-gray-500 font-medium">ASAN Növbə İdarəetmə Sistemi</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-asan-blue' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'logs' ? 'bg-white shadow-sm text-asan-blue' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Database className="w-4 h-4" /> Loglar
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Çıxış
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Bugünkü cəmi" value={stats.totalToday} icon={<Users className="w-6 h-6" />} color="blue" />
            <StatCard title="Tamamlanan" value={stats.completedToday} icon={<CheckCircle className="w-6 h-6" />} color="green" />
            <StatCard title="İmtina edilən" value={stats.cancelledToday} icon={<XCircle className="w-6 h-6" />} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services Management */}
            <div className="asan-card h-fit border border-gray-100 shadow-xl shadow-gray-100/50">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-asan-blue" /> Xidmətlər
              </h2>
              <form onSubmit={handleAddService} className="mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Yeni xidmət adı"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="flex-grow p-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-asan-blue text-sm transition-all"
                  />
                  <button type="submit" className="bg-asan-blue text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-asan-blue/20">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>
              <div className="space-y-2">
                {services.map(s => (
                  <div key={s._id} className="group p-3 bg-white hover:bg-gray-50 rounded-xl text-sm font-semibold border border-gray-100 flex justify-between items-center transition-all">
                    <span>{s.name}</span>
                    <button 
                      onClick={() => handleDeleteService(s._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Queues List */}
            <div className="lg:col-span-2 asan-card border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">Təsdiqlənmiş (Aktiv) Növbələr</h2>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">Live</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Filter className="w-4 h-4" />
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-transparent outline-none font-bold"
                    >
                      <option value="">Hamısı</option>
                      <option value="waiting">Gözləyir</option>
                      <option value="done">Tamamlandı</option>
                      <option value="cancelled">İmtina</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 font-black border-b border-gray-50">
                      <th className="pb-4">Nömrə</th>
                      <th className="pb-4">Xidmət / Kateqoriya</th>
                      <th className="pb-4">FİN / Yaş</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {queues.filter(q => q.status === 'waiting' || filterStatus !== '').map(q => (
                      <tr key={q._id} className="text-sm hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 font-black text-asan-blue text-lg">{q.queueNumber}</td>
                        <td className="py-5">
                          <div className="font-bold text-gray-800">{q.serviceType}</div>
                          <div className="text-[10px] uppercase tracking-wider font-black text-gray-400 mt-0.5">{q.category}</div>
                        </td>
                        <td className="py-5">
                          <div className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">{q.finCode}</div>
                          <div className="text-xs font-bold text-gray-400 mt-1">{q.age ? `${q.age} yaş` : 'Yaş qeyd edilməyib'}</div>
                        </td>
                        <td className="py-5">
                          <StatusBadge status={q.status} />
                        </td>
                        <td className="py-5">
                          <div className="flex gap-2">
                            {q.status === 'waiting' && (
                              <button 
                                onClick={() => handleUpdateStatus(q._id, 'done')}
                                className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                                title="Tamamla"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {q.status !== 'cancelled' && (
                              <button 
                                onClick={() => handleUpdateStatus(q._id, 'cancelled')}
                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                title="Ləğv et"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {queues.length === 0 && !loading && (
                  <div className="text-center py-20 text-gray-400 font-bold">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    Aktiv növbə tapılmadı
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'logs' && (
        <div className="asan-card border border-gray-100 shadow-2xl shadow-gray-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase">Arxiv və Loglar</h2>
              <p className="text-sm text-gray-500">Gündəlik növbə tarixçəsi</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 w-full md:w-auto">
              <Calendar className="w-5 h-5 text-asan-blue ml-2" />
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent outline-none font-bold text-gray-700 p-2 cursor-pointer"
              />
              <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
              <button 
                onClick={fetchData}
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                title="Yenilə"
              >
                <History className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            {logQueues.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
                    <th className="p-4">ID / Tarix</th>
                    <th className="p-4">Nömrə</th>
                    <th className="p-4">Vətəndaş FİN</th>
                    <th className="p-4">Xidmət Sahəsi</th>
                    <th className="p-4">Kateqoriya</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Əməliyyat Zamanı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logQueues.map(q => (
                    <tr key={q._id} className="text-xs hover:bg-gray-50/30 transition-all group">
                      <td className="p-4">
                        <div className="text-[10px] font-mono text-gray-300">#{q._id.slice(-8)}</div>
                        <div className="font-bold text-gray-500">{new Date(q.timestamp).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 font-black text-asan-blue">{q.queueNumber}</td>
                      <td className="p-4 font-mono font-bold">{q.finCode}</td>
                      <td className="p-4 font-bold text-gray-700">{q.serviceType}</td>
                      <td className="p-4 text-gray-500">{q.category}</td>
                      <td className="p-4">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="p-4 text-right font-mono text-gray-400">
                        {new Date(q.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20 text-gray-400 font-bold">
                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                Seçilmiş tarixdə log tapılmadı
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };
  return (
    <div className="asan-card flex items-center gap-6 border border-gray-100 hover:border-asan-blue/20 transition-all">
      <div className={`p-5 rounded-3xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">{title}</div>
        <div className="text-3xl font-black text-gray-900">{value}</div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    waiting: 'bg-green-50 text-green-600 border-green-100',
    done: 'bg-blue-50 text-blue-600 border-blue-100',
    cancelled: 'bg-red-50 text-red-600 border-red-100'
  };
  const labels = {
    waiting: 'Təsdiqləndi',
    done: 'Tamamlandı',
    cancelled: 'İmtina'
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border tracking-tighter ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default AdminDashboard;
