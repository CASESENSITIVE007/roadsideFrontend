'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, History, Bell, Loader2, LogOut, Navigation } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedService, setSelectedService] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [userData, requestsData] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getMyRequests()
      ]);
      setUser(userData);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error: any) {
      console.error("Failed to load dashboard:", error);
      // Only redirect to login if it's an authentication error (401)
      // Don't redirect on server errors (500) - could be temporary database issues
      if (error.message?.includes('401')) {
        router.push('/login');
      } else {
        // Show error state instead of redirecting
        alert('Server error. Please try again in a moment.');
      }
    } finally {
      setLoading(false);
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
    await loadDashboardData();
  }

  // Get current location
  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ lat, lng });
          
          // Try to get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data.display_name) {
              setLocation(data.display_name);
            } else {
              setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          } catch {
            setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error("Location error:", error);
          alert("Could not get your location. Please enter it manually.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

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

  const handleRequestHelp = async () => {
    if (!selectedService || !location) {
      alert("Please select a service and enter your location");
      return;
    }

    if (!vehicleMake || !vehicleModel) {
      alert("Please enter your vehicle details");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createRequest({
        latitude: coordinates.lat || 0, 
        longitude: coordinates.lng || 0,
        location_address: location,
        service_type: selectedService,
        priority: 'medium',
        description: `Request for ${selectedService}`,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_year: parseInt(vehicleYear) || new Date().getFullYear(),
        vehicle_plate: vehiclePlate || "N/A"
      });
      
      alert("Request created successfully! A provider will be dispatched shortly.");
      // Clear form
      setSelectedService('');
      setVehicleMake('');
      setVehicleModel('');
      setVehicleYear('');
      setVehiclePlate('');
      loadDashboardData(); 
    } catch (error) {
      console.error("Request failed:", error);
      alert("Failed to create request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;
    
    try {
      await apiClient.cancelRequest(id);
      loadDashboardData();
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel request");
    }
  };

  const activeRequest = requests.find(r => ['dispatched', 'pending', 'assigned'].includes(r.status));
  const historyRequests = requests.filter(r => r.status === 'completed' || r.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white">
      {/* Header */}
      <header className="border-b border-slate-700 sticky top-0 z-40 bg-[#111418]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">R</div>
            <span className="font-bold text-lg">Roadside Assist</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-slate-400">Hi, {user?.first_name || 'User'}</span>
            <Bell className="w-5 h-5 cursor-pointer hover:text-blue-400" />
            
            {/* --- LOGOUT BUTTON --- */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>

            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.first_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Active Request Card */}
        {activeRequest && (
          <div className="bg-[#161b22] border border-blue-500/30 rounded-lg p-6 mb-8 shadow-lg shadow-blue-500/5">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Active Request #{activeRequest.id}</h3>
                  <p className="text-slate-400 text-sm">Service: {activeRequest.service_type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs mb-2">STATUS</p>
                <p className={`font-semibold uppercase ${
                  activeRequest.status === 'pending' ? 'text-yellow-400' : 
                  activeRequest.status === 'assigned' ? 'text-blue-400' :
                  'text-green-400'
                }`}>{activeRequest.status}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{activeRequest.location_address}</span>
            </div>

            {activeRequest.status === 'pending' && (
              <button
                onClick={() => handleCancelRequest(activeRequest.id)}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition"
              >
                Cancel Request
              </button>
            )}
          </div>
        )}

        {/* Emergency Assistance Section - Only show if no active request */}
        {!activeRequest && (
          <div className="bg-[#161b22] border border-slate-700 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-2">Emergency Assistance</h2>
            <p className="text-slate-400 mb-6">Select the service you need and confirm your location.</p>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-blue-600 rounded-full text-xs">1</span>
                Select Service Type
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'towing', icon: '🚗', label: 'Towing' },
                  { id: 'battery', icon: '🔋', label: 'Battery Jump' },
                  { id: 'tire', icon: '🛞', label: 'Flat Tire' },
                  { id: 'fuel', icon: '⛽', label: 'Fuel Delivery' },
                ].map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`border rounded-lg p-6 text-center transition flex flex-col items-center gap-3 ${
                      selectedService === service.id 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-3xl">{service.icon}</span>
                    <span className="text-sm font-medium">{service.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-blue-600 rounded-full text-xs">2</span>
                Location & Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Current Location</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 flex-1">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter breakdown address..."
                        className="bg-transparent border-none outline-none flex-1 text-white"
                      />
                    </div>
                    <button
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg transition flex items-center gap-2"
                    >
                      {isLocating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Navigation className="w-5 h-5" />
                      )}
                      <span className="hidden sm:inline">Locate Me</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Vehicle Make</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="e.g., Toyota, Ford, Honda"
                      className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Vehicle Model</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g., Camry, F-150, Civic"
                      className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Vehicle Year</label>
                    <input
                      type="number"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      placeholder="e.g., 2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">License Plate (Optional)</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="e.g., ABC-1234"
                      className="w-full bg-[#111418] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={isSubmitting || !selectedService || !location || !vehicleMake || !vehicleModel}
              onClick={handleRequestHelp}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Request Help Now'}
            </button>
          </div>
        )}

        {/* Recent History */}
        <div className="bg-[#161b22] border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              Request History
            </h3>
          </div>

          <div className="space-y-4">
            {historyRequests.length > 0 ? historyRequests.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-700 last:border-0">
                <div>
                  <p className="font-semibold capitalize">{item.service_type}</p>
                  <p className="text-slate-400 text-sm">{new Date(item.created_at).toLocaleString()}</p>
                  <p className="text-slate-500 text-xs">{item.location_address}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.final_cost || '0.00'}</p>
                  <p className={`text-sm ${item.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                    {item.status}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-4">No request history yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}