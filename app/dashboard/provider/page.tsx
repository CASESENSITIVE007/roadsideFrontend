// app/dashboard/provider/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Bell, Loader2, Smartphone, LogOut, RefreshCw, Settings, Clock, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

type TabType = 'overview' | 'active' | 'history' | 'settings';

export default function ProviderDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [nearbyRequests, setNearbyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<'online' | 'busy' | 'offline'>('offline');
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    company_name: '',
    license_number: '',
    vehicle_type: 'Tow Truck',
    vehicle_plate: '',
    insurance_provider: '',
    insurance_policy_number: '',
  });
  const [isSettingUp, setIsSettingUp] = useState(false);

  const loadProviderData = useCallback(async () => {
    try {
      // First check if user has a provider profile
      let prof = null;
      try {
        prof = await apiClient.getProviderProfile();
      } catch (profileError: any) {
        // Check if user's role is provider - if so, they need to complete setup
        try {
          const user = await apiClient.getCurrentUser() as any;
          if (user.role === 'provider') {
            // User is a provider but hasn't completed profile setup
            setNeedsSetup(true);
            setLoading(false);
            return;
          } else {
            // User is not a provider at all
            alert("You are not registered as a service provider. Redirecting to user dashboard.");
            router.push('/dashboard/user');
            return;
          }
        } catch {
          router.push('/login');
          return;
        }
      }
      
      const [assign, allRequests] = await Promise.all([
        apiClient.getMyAssignments(),
        apiClient.request<any[]>('/requests/')
      ]);
      
      setProfile(prof);
      setAssignments(Array.isArray(assign) ? assign : []);
      const pending = Array.isArray(allRequests) 
        ? allRequests.filter(r => r.status === 'pending')
        : [];
      setNearbyRequests(pending);
      // Note: Backend uses current_status field
      const profileData = prof as any;
      setStatus(profileData?.current_status || 'offline');
    } catch (error: any) {
      console.error("Data load failed", error);
      // Only redirect to login if it's an authentication error (401)
      if (error.message?.includes('401')) {
        router.push('/login');
      } else {
        alert('Server error. Please try again in a moment.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const token = apiClient.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    await loadProviderData();
    // Start location tracking after auth check
    startLocationTracking();
  }

  function startLocationTracking() {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          apiClient.updateProviderLocation(pos.coords.latitude, pos.coords.longitude)
            .catch(err => console.error("Location update error", err));
        },
        (err) => console.error("Location error", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
      // Store watchId for cleanup if needed
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      apiClient.clearToken();
      router.push('/login');
    }
  };

  // --- PROVIDER SETUP FUNCTION ---
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData.company_name || !setupData.license_number || !setupData.vehicle_plate) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsSettingUp(true);
    try {
      await apiClient.createProviderProfile(setupData);
      alert("Provider profile created successfully!");
      setNeedsSetup(false);
      await loadProviderData();
    } catch (error) {
      console.error("Setup failed:", error);
      alert("Failed to create provider profile. Please try again.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProviderData();
  };

  const toggleStatus = async () => {
    const newStatus = status === 'online' ? 'offline' : 'online';
    try {
      await apiClient.updateProviderStatus(newStatus);
      setStatus(newStatus);
    } catch {
      alert("Failed to update status");
    }
  };

  const acceptJob = async (id: number) => {
    try {
      await apiClient.assignRequest(id);
      alert("Job accepted successfully!");
      loadProviderData(); // Refresh to move job to Current Mission
    } catch {
      alert("Job already taken or error occurred");
    }
  };

  const completeJob = async (id: number) => {
    const cost = prompt("Enter final service cost:");
    if (!cost) return;
    try {
      await apiClient.completeRequest(id, parseFloat(cost));
      alert("Job completed successfully!");
      loadProviderData();
    } catch {
      alert("Failed to complete job");
    }
  };

  // Logic for UI display - check for both 'dispatched' and 'assigned' status
  const currentMission = assignments.find(a => a.status === 'dispatched' || a.status === 'assigned' || a.status === 'accepted' || a.status === 'in_progress');
  const activeJobs = assignments.filter(a => ['dispatched', 'assigned', 'accepted', 'in_progress'].includes(a.status));
  const completedHistory = assignments.filter(a => a.status === 'completed');
  const totalEarnings = completedHistory.reduce((sum, job) => sum + (parseFloat(job.final_cost) || 0), 0);
  const pendingRequests = nearbyRequests.filter(r => r.status === 'pending');

  if (loading) return (
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  // Show setup form if provider needs to complete their profile
  if (needsSetup) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#161b22] border border-slate-700 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚗</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Complete Your Provider Profile</h1>
            <p className="text-slate-400">Please fill in your business details to start accepting jobs.</p>
          </div>

          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Company/Business Name *</label>
              <input
                type="text"
                value={setupData.company_name}
                onChange={(e) => setSetupData({...setupData, company_name: e.target.value})}
                placeholder="e.g., Quick Tow Services"
                className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">License Number *</label>
              <input
                type="text"
                value={setupData.license_number}
                onChange={(e) => setSetupData({...setupData, license_number: e.target.value})}
                placeholder="e.g., TOW-12345"
                className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Vehicle Type</label>
                <select
                  value={setupData.vehicle_type}
                  onChange={(e) => setSetupData({...setupData, vehicle_type: e.target.value})}
                  className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Tow Truck">Tow Truck</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Service Van">Service Van</option>
                  <option value="Pickup Truck">Pickup Truck</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Vehicle Plate *</label>
                <input
                  type="text"
                  value={setupData.vehicle_plate}
                  onChange={(e) => setSetupData({...setupData, vehicle_plate: e.target.value})}
                  placeholder="e.g., ABC-1234"
                  className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Insurance Provider</label>
              <input
                type="text"
                value={setupData.insurance_provider}
                onChange={(e) => setSetupData({...setupData, insurance_provider: e.target.value})}
                placeholder="e.g., State Farm"
                className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Insurance Policy Number</label>
              <input
                type="text"
                value={setupData.insurance_policy_number}
                onChange={(e) => setSetupData({...setupData, insurance_policy_number: e.target.value})}
                placeholder="e.g., POL-987654"
                className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSettingUp}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 mt-6"
            >
              {isSettingUp ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full mt-4 py-2 text-slate-400 hover:text-white transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-[#111418] border-r border-slate-700 min-h-screen p-6 sticky top-0">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">R</div>
            <span className="font-bold">Roadside Pro</span>
          </div>

          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
              {profile?.user?.first_name?.charAt(0) || 'P'}
            </div>
            <div>
              <p className="font-semibold text-sm">{profile?.user?.first_name || 'Provider'} {profile?.user?.last_name || ''}</p>
              <p className="text-slate-400 text-xs capitalize">{profile?.vehicle_type || 'Service Provider'}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span>📊</span><span className="text-sm font-medium">Overview</span>
            </button>
            <button 
              onClick={() => setActiveTab('active')}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span>⚙️</span><span className="text-sm font-medium">Active Jobs</span>
              {activeJobs.length > 0 && (
                <span className="ml-auto bg-blue-500 text-xs px-2 py-0.5 rounded-full">{activeJobs.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span>📜</span><span className="text-sm font-medium">History</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span>🔧</span><span className="text-sm font-medium">Settings</span>
            </button>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          <header className="border-b border-slate-700 sticky top-0 z-40 bg-[#111418]/95 backdrop-blur px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {activeTab === 'overview' && 'Provider Dashboard'}
              {activeTab === 'active' && 'Active Jobs'}
              {activeTab === 'history' && 'Job History'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={toggleStatus}
                className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition ${
                  status === 'online' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium capitalize">{status}</span>
              </button>
              <Bell className="w-5 h-5 cursor-pointer hover:text-blue-400" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </header>

          <div className="p-8">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <StatCard label="Total Earnings" value={`$${totalEarnings.toFixed(2)}`} trend="Calculated from history" />
                  <StatCard label="Jobs Completed" value={completedHistory.length.toString()} trend="Lifetime" />
                  <StatCard label="Active Jobs" value={activeJobs.length.toString()} trend="Currently assigned" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Current Mission */}
                  <div className="bg-[#161b22] border border-slate-700 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-slate-700">
                      <h3 className="text-lg font-bold">Current Mission</h3>
                    </div>
                    {currentMission ? (
                      <div className="p-6 space-y-4">
                        <div className="bg-[#111418] rounded-lg p-4">
                          <p className="text-blue-400 text-xs font-bold mb-1">IN PROGRESS</p>
                          <h4 className="font-bold text-lg mb-2">{currentMission.service_type}</h4>
                          <p className="text-sm text-slate-300 mb-4 flex items-center gap-1">
                            <MapPin className="w-3 h-3"/> {currentMission.location_address}
                          </p>
                          <div className="flex items-center gap-3 border-t border-slate-700 pt-4">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <Smartphone className="w-4 h-4 text-blue-400"/>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Vehicle</p>
                              <p className="text-sm font-semibold">{currentMission.vehicle_make} {currentMission.vehicle_model}</p>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => completeJob(currentMission.id)}
                          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                        >
                          Complete Job & Invoice
                        </button>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-500">No active mission. Set status to Online to receive jobs.</div>
                    )}
                  </div>

                  {/* Nearby Requests */}
                  <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-6">Nearby Requests ({pendingRequests.length})</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {pendingRequests.length > 0 ? pendingRequests.map((job) => (
                        <div key={job.id} className="bg-[#111418] rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-blue-400">{job.service_type}</p>
                              <p className="text-slate-400 text-xs truncate max-w-[200px]">{job.location_address}</p>
                            </div>
                            <span className="text-xs font-bold text-green-400">NEW</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => acceptJob(job.id)}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
                            >
                              Accept Job
                            </button>
                          </div>
                        </div>
                      )) : (
                        <p className="text-slate-500 text-center py-4">No pending requests nearby. Stay online to receive new jobs.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ACTIVE JOBS TAB */}
            {activeTab === 'active' && (
              <div className="space-y-6">
                <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-6">Your Active Jobs ({activeJobs.length})</h3>
                  {activeJobs.length > 0 ? (
                    <div className="space-y-4">
                      {activeJobs.map((job) => (
                        <div key={job.id} className="bg-[#111418] rounded-lg p-6 border border-slate-700">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-blue-400 text-xs font-bold mb-1 uppercase">{job.status}</p>
                              <h4 className="font-bold text-xl">{job.service_type}</h4>
                            </div>
                            <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                              {job.priority?.toUpperCase() || 'MEDIUM'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-slate-400">Location</p>
                              <p className="text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3"/> {job.location_address}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Vehicle</p>
                              <p className="text-sm">{job.vehicle_make} {job.vehicle_model} ({job.vehicle_year})</p>
                            </div>
                          </div>
                          {job.description && (
                            <div className="mb-4">
                              <p className="text-xs text-slate-400">Notes</p>
                              <p className="text-sm">{job.description}</p>
                            </div>
                          )}
                          <button 
                            onClick={() => completeJob(job.id)}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Complete Job
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No active jobs</p>
                      <p className="text-sm mt-2">Accept a nearby request to get started</p>
                    </div>
                  )}
                </div>

                {/* Pending Requests to Accept */}
                <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-6">Available Requests ({pendingRequests.length})</h3>
                  {pendingRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingRequests.map((job) => (
                        <div key={job.id} className="bg-[#111418] rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-blue-400">{job.service_type}</p>
                              <p className="text-slate-400 text-xs">{job.location_address}</p>
                            </div>
                            <span className="text-xs font-bold text-green-400 animate-pulse">NEW</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">
                            {job.vehicle_make} {job.vehicle_model} • {job.priority || 'Medium'} Priority
                          </p>
                          <button 
                            onClick={() => acceptJob(job.id)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
                          >
                            Accept Job
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No pending requests available</p>
                  )}
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Completed Jobs ({completedHistory.length})</h3>
                  <p className="text-green-400 font-bold">Total Earned: ${totalEarnings.toFixed(2)}</p>
                </div>
                {completedHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-slate-400 border-b border-slate-700">
                        <tr>
                          <th className="pb-3 px-4">ID</th>
                          <th className="pb-3 px-4">Service</th>
                          <th className="pb-3 px-4">Location</th>
                          <th className="pb-3 px-4">Vehicle</th>
                          <th className="pb-3 px-4">Cost</th>
                          <th className="pb-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedHistory.map((job) => (
                          <tr key={job.id} className="border-b border-slate-800 hover:bg-slate-700/20">
                            <td className="py-4 px-4 font-mono">#{job.id}</td>
                            <td className="py-4 px-4">{job.service_type}</td>
                            <td className="py-4 px-4 text-slate-400 max-w-[200px] truncate">{job.location_address}</td>
                            <td className="py-4 px-4">{job.vehicle_make} {job.vehicle_model}</td>
                            <td className="py-4 px-4 font-bold text-green-400">${job.final_cost || '0.00'}</td>
                            <td className="py-4 px-4">
                              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Completed</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No completed jobs yet</p>
                    <p className="text-sm mt-2">Complete your first job to see it here</p>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Profile Info */}
                <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Profile Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Company Name</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">{profile?.company_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">License Number</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">{profile?.license_number || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Vehicle Type</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">{profile?.vehicle_type || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Vehicle Plate</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">{profile?.vehicle_plate || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Insurance Provider</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">{profile?.insurance_provider || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Policy Number</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">{profile?.insurance_policy_number || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-6">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Name</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">
                        {profile?.user?.first_name} {profile?.user?.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Email</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">{profile?.user?.email || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Phone</label>
                      <p className="bg-[#111418] px-4 py-3 rounded-lg border border-slate-700">{profile?.user?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Status</label>
                      <p className={`bg-[#111418] px-4 py-3 rounded-lg border border-slate-700 capitalize ${status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                        {status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-6">Account Actions</h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleLogout}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend }: { label: string, value: string, trend: string }) {
  return (
    <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-blue-400 text-xs">{trend}</p>
    </div>
  );
}