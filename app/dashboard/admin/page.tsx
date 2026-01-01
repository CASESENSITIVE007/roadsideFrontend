// app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Bell, Download, Filter, Loader2, LogOut, RefreshCw, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    activeRequests: 0,
    totalProviders: 0,
    onlineProviders: 0,
    avgResponse: '14 min',
  });
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [assigning, setAssigning] = useState(false);

  const loadAdminData = useCallback(async () => {
    try {
      // Fetching broad data using existing endpoints
      const [requestsData, providersData, usersData] = await Promise.all([
        apiClient.request<any>('/requests/'),
        apiClient.getProviders() as any,
        apiClient.request<any>('/users/')
      ]);

      console.log('Admin Dashboard - Raw requestsData:', requestsData);
      console.log('Admin Dashboard - Raw providersData:', providersData);
      console.log('Admin Dashboard - Raw usersData:', usersData);

      // Handle both array and paginated response formats
      const requests = Array.isArray(requestsData) 
        ? requestsData 
        : ((requestsData as any)?.results || (requestsData as any)?.data || []);
      
      const providersList = Array.isArray(providersData) 
        ? providersData 
        : ((providersData as any)?.results || (providersData as any)?.data || []);
      
      const usersList = Array.isArray(usersData) 
        ? usersData 
        : ((usersData as any)?.results || (usersData as any)?.data || []);
      
      console.log('Admin Dashboard - Parsed requests:', requests);
      console.log('Admin Dashboard - Parsed providers:', providersList);
      console.log('Admin Dashboard - Parsed users:', usersList);
      
      const active = requests.filter((r: any) => ['pending', 'dispatched', 'assigned'].includes(r.status));
      // Note: Backend uses current_status field
      const online = providersList.filter((p: any) => p.current_status === 'online');

      setAllRequests(requests);
      setProviders(providersList);
      setAllUsers(usersList);
      setStats({
        activeRequests: active.length,
        totalProviders: providersList.length,
        onlineProviders: online.length,
        avgResponse: calculateAvgResponse(requests)
      });
    } catch (error: any) {
      console.error("Failed to load admin data:", error);
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
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    async function checkAuthAndLoad() {
      const token = apiClient.getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Check if user is admin
      try {
        const user = await apiClient.getCurrentUser() as any;
        if (user.role !== 'admin') {
          alert("Access denied. Admin privileges required.");
          router.push(user.role === 'provider' ? '/dashboard/provider' : '/dashboard/user');
          return;
        }
      } catch {
        router.push('/login');
        return;
      }
      
      if (isMounted) {
        await loadAdminData();
        // Poll for updates every 30 seconds for real-time monitoring
        intervalId = setInterval(loadAdminData, 30000);
      }
    }

    checkAuthAndLoad();

    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadAdminData, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
  };

  // Open assign modal
  const openAssignModal = (request: any) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  // Assign provider to request
  const handleAssignProvider = async (providerId: number) => {
    if (!selectedRequest) return;
    
    setAssigning(true);
    try {
      await apiClient.request(`/requests/${selectedRequest.id}/admin_assign/`, {
        method: 'POST',
        body: JSON.stringify({ provider_id: providerId }),
      });
      
      alert('Provider assigned successfully!');
      setShowAssignModal(false);
      setSelectedRequest(null);
      await loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Failed to assign provider:', error);
      alert('Failed to assign provider. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  function calculateAvgResponse(requests: any[]) {
    const completed = requests.filter(r => r.status === 'completed' && r.created_at && r.completed_at);
    if (completed.length === 0) return 'N/A';
    
    const totalMinutes = completed.reduce((sum, req) => {
      const start = new Date(req.created_at).getTime();
      const end = new Date(req.completed_at).getTime();
      return sum + (end - start) / 60000;
    }, 0);
    
    const avg = Math.round(totalMinutes / completed.length);
    return avg < 60 ? `${avg} min` : `${Math.round(avg / 60)} hr`;
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

  if (loading) return (
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <header className="border-b border-slate-700 sticky top-0 z-40 bg-[#111418]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">R</div>
            <span className="font-bold text-lg">RoadAssistance</span>
          </div>
          <div className="flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search ID, Customer, or Provider..."
              className="w-full bg-[#161b22] border border-slate-700 rounded-lg px-4 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 cursor-pointer hover:text-blue-400" />
            
            {/* --- LOGOUT BUTTON --- */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
            
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">AD</div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Nav */}
        <aside className="w-48 bg-[#111418] border-r border-slate-700 min-h-screen p-4 sticky top-16">
          <nav className="space-y-1">
            <SidebarLink icon="📊" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarLink icon="📋" label="Requests" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
            <SidebarLink icon="🚗" label="Providers" active={activeTab === 'providers'} onClick={() => setActiveTab('providers')} />
            <SidebarLink icon="👥" label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <SidebarLink icon="⚙️" label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Operation Command Center</h1>
              <p className="text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                System Live: Monitoring {stats.activeRequests} ongoing missions.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStatCard label="Active Requests" value={stats.activeRequests} color="from-blue-500" />
            <AdminStatCard label="Providers Online" value={stats.onlineProviders} color="from-green-500" />
            <AdminStatCard label="Avg Response" value={stats.avgResponse} color="from-purple-500" />
            <AdminStatCard label="Total Providers" value={stats.totalProviders} color="from-orange-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Live Map Preview */}
            <div className="lg:col-span-2 bg-[#161b22] border border-slate-700 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-bold">Live Operations Map</h2>
                <div className="flex gap-2 text-xs">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Job</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Provider</span>
                </div>
              </div>
              <div className="relative h-80 bg-slate-800/50 flex items-center justify-center">
                <div className="text-center">
                   <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                   <p className="text-slate-500 text-sm">Tracking {stats.activeRequests + stats.onlineProviders} live entities</p>
                </div>
              </div>
            </div>

            {/* System Health & Top Providers */}
            <div className="space-y-6">
              <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold mb-4">System Health</h3>
                <div className="space-y-4">
                  <HealthBar label="API Gateway" value="99.9%" />
                  <HealthBar label="DB Cluster" value="2.1ms" />
                  <HealthBar label="Socket Conn" value="Active" color="bg-green-500" />
                </div>
              </div>
              
              <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                <h4 className="font-bold mb-4">Active Providers</h4>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                  {providers.length > 0 ? providers.slice(0, 5).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.current_status === 'online' ? 'bg-green-500' : p.current_status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <p className="font-medium">{p.user?.first_name || 'Provider'} {p.user?.last_name || ''}</p>
                      </div>
                      <span className="text-slate-500 text-xs">{p.vehicle_type || 'N/A'}</span>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-center py-2">No providers registered</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table: Critical/Recent Requests */}
          <div className="bg-[#161b22] border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold">Recent System Logs ({allRequests.length} total)</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-700 rounded-lg transition"><Filter className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-slate-700 rounded-lg transition"><Download className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#111418] text-slate-400">
                  <tr>
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">STATUS</th>
                    <th className="py-3 px-6">CUSTOMER</th>
                    <th className="py-3 px-6">SERVICE</th>
                    <th className="py-3 px-6">LOCATION</th>
                    <th className="py-3 px-6">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">No requests found</td>
                    </tr>
                  )}
                  {allRequests.slice(0, 8).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-700/20 transition">
                      <td className="py-4 px-6 text-slate-500">#{req.id}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          req.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 
                          req.status === 'dispatched' ? 'bg-blue-500/10 text-blue-500' : 
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium">{req.vehicle_make} {req.vehicle_model}</td>
                      <td className="py-4 px-6 capitalize">{req.service_type}</td>
                      <td className="py-4 px-6 text-slate-400 truncate max-w-[150px]">{req.location_address}</td>
                      <td className="py-4 px-6 text-slate-500">{new Date(req.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Service Requests</h1>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg transition"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              <div className="bg-[#161b22] border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#111418] text-slate-400">
                      <tr>
                        <th className="py-3 px-6">ID</th>
                        <th className="py-3 px-6">STATUS</th>
                        <th className="py-3 px-6">CUSTOMER</th>
                        <th className="py-3 px-6">SERVICE</th>
                        <th className="py-3 px-6">LOCATION</th>
                        <th className="py-3 px-6">PRIORITY</th>
                        <th className="py-3 px-6">DATE</th>
                        <th className="py-3 px-6">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {allRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-700/20 transition">
                          <td className="py-4 px-6 text-slate-500">#{req.id}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              req.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 
                              req.status === 'assigned' ? 'bg-yellow-500/10 text-yellow-500' :
                              req.status === 'dispatched' ? 'bg-blue-500/10 text-blue-500' : 
                              req.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                              {req.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-medium">{req.vehicle_make} {req.vehicle_model}</td>
                          <td className="py-4 px-6 capitalize">{req.service_type}</td>
                          <td className="py-4 px-6 text-slate-400 truncate max-w-[150px]">{req.location_address}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded text-xs ${
                              req.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              req.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {req.priority || 'medium'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500">{new Date(req.created_at).toLocaleDateString()}</td>
                          <td className="py-4 px-6">
                            {req.status === 'pending' ? (
                              <button 
                                onClick={() => openAssignModal(req)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
                              >
                                Assign
                              </button>
                            ) : (
                              <span className="text-slate-500 text-xs">
                                {req.provider ? `Assigned` : '-'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allRequests.length === 0 && (
                    <div className="text-center py-12 text-slate-500">No requests found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Service Providers</h1>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg transition"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <div key={provider.id} className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg font-bold">
                        {provider.user?.first_name?.[0] || 'P'}{provider.user?.last_name?.[0] || ''}
                      </div>
                      <div>
                        <h3 className="font-bold">{provider.user?.first_name} {provider.user?.last_name}</h3>
                        <p className="text-sm text-slate-400">{provider.user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          provider.current_status === 'online' ? 'bg-green-500/20 text-green-400' :
                          provider.current_status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {provider.current_status || 'offline'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vehicle</span>
                        <span>{provider.vehicle_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">License</span>
                        <span>{provider.license_plate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone</span>
                        <span>{provider.user?.phone_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {providers.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-500 bg-[#161b22] border border-slate-700 rounded-lg">
                    No providers registered yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Users</h1>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg transition"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="bg-[#161b22] border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#111418] text-slate-400">
                      <tr>
                        <th className="py-3 px-6">ID</th>
                        <th className="py-3 px-6">NAME</th>
                        <th className="py-3 px-6">EMAIL</th>
                        <th className="py-3 px-6">ROLE</th>
                        <th className="py-3 px-6">PHONE</th>
                        <th className="py-3 px-6">VERIFIED</th>
                        <th className="py-3 px-6">JOINED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {allUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-700/20 transition">
                          <td className="py-4 px-6 text-slate-500">#{user.id}</td>
                          <td className="py-4 px-6 font-medium">{user.first_name} {user.last_name}</td>
                          <td className="py-4 px-6 text-slate-400">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 
                              user.role === 'provider' ? 'bg-blue-500/10 text-blue-500' : 
                              'bg-green-500/10 text-green-500'
                            }`}>
                              {user.role?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400">{user.phone_number || 'N/A'}</td>
                          <td className="py-4 px-6">
                            {user.is_verified ? (
                              <span className="text-green-400">✓ Yes</span>
                            ) : (
                              <span className="text-red-400">✗ No</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-500">No users found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-3xl font-bold mb-8">Settings</h1>
              <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6 max-w-2xl">
                <h2 className="text-xl font-bold mb-6">Admin Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input type="email" disabled className="w-full bg-[#0d0f12] border border-slate-700 rounded-lg px-4 py-2 text-slate-300" value="admin@roadside.com" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Change Password</label>
                    <input type="password" placeholder="New password" className="w-full bg-[#0d0f12] border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Confirm Password</label>
                    <input type="password" placeholder="Confirm new password" className="w-full bg-[#0d0f12] border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                  </div>
                  <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Assign Provider Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Assign Provider</h2>
              <button 
                onClick={() => { setShowAssignModal(false); setSelectedRequest(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Request Details */}
            <div className="bg-[#0d0f12] rounded-lg p-4 mb-6">
              <h3 className="text-sm text-slate-400 mb-2">Request Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-slate-400">ID:</span> {selectedRequest.request_id}</p>
                <p><span className="text-slate-400">Service:</span> <span className="capitalize">{selectedRequest.service_type}</span></p>
                <p><span className="text-slate-400">Location:</span> {selectedRequest.location_address}</p>
                <p><span className="text-slate-400">Vehicle:</span> {selectedRequest.vehicle_make} {selectedRequest.vehicle_model}</p>
              </div>
            </div>
            
            {/* Available Providers */}
            <div>
              <h3 className="text-sm text-slate-400 mb-3">Select a Provider</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {providers.length > 0 ? providers.map((provider) => (
                  <div 
                    key={provider.id} 
                    className="flex items-center justify-between p-3 bg-[#0d0f12] rounded-lg hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        provider.current_status === 'online' ? 'bg-green-500' : 
                        provider.current_status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{provider.user?.first_name} {provider.user?.last_name}</p>
                        <p className="text-xs text-slate-400">{provider.vehicle_type} • {provider.company_name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignProvider(provider.id)}
                      disabled={assigning}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white text-xs rounded transition"
                    >
                      {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                )) : (
                  <p className="text-center text-slate-500 py-4">No providers available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function SidebarLink({ icon, label, active = false, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition text-sm ${active ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}

function AdminStatCard({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <div className={`w-10 h-10 bg-gradient-to-br ${color} to-transparent rounded-lg opacity-20`}></div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <div className="w-full h-1 bg-slate-700 rounded-full mt-3 overflow-hidden">
        <div className="h-full w-2/3 bg-blue-600"></div>
      </div>
    </div>
  );
}

function HealthBar({ label, value, color = "bg-blue-500" }: { label: string, value: string, color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full w-[90%] ${color}`}></div>
      </div>
    </div>
  );
}