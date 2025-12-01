import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdSettings, AdPlacementConfig } from '../types';
import { CheckIcon, CopyIcon, RefreshIcon } from './Icons';

// --- Constants & Defaults ---
const DEFAULT_SETTINGS: AdSettings = {
  publisherId: '',
  globalEnabled: true,
  placements: {
    header: { id: '', enabled: true, format: 'auto' },
    sidebar: { id: '', enabled: true, format: 'auto' },
    resultsTop: { id: '', enabled: true, format: 'auto' },
    resultsBottom: { id: '', enabled: true, format: 'auto' },
  },
};

// --- Context ---
interface AdContextType {
  settings: AdSettings;
  updateSettings: (newSettings: AdSettings) => void;
  isDashboardOpen: boolean;
  setDashboardOpen: (open: boolean) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AdSettings>(DEFAULT_SETTINGS);
  const [isDashboardOpen, setDashboardOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tuberank_ad_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse ad settings", e);
      }
    }
    setLoaded(true);
  }, []);

  // Save to LocalStorage on change and Inject Script
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('tuberank_ad_settings', JSON.stringify(settings));

    // Inject AdSense Script dynamically if publisher ID exists
    if (settings.publisherId && settings.globalEnabled) {
      const scriptId = 'adsense-script-main';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.publisherId}`;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }
    }
  }, [settings, loaded]);

  const updateSettings = (newSettings: AdSettings) => {
    setSettings(newSettings);
  };

  return (
    <AdContext.Provider value={{ settings, updateSettings, isDashboardOpen, setDashboardOpen }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) throw new Error("useAds must be used within AdProvider");
  return context;
};

// --- Components ---

export const AdUnit = ({ placementKey, className = '' }: { placementKey: keyof AdSettings['placements'], className?: string }) => {
  const { settings } = useAds();
  const config = settings.placements[placementKey];

  useEffect(() => {
    if (settings.globalEnabled && config.enabled && config.id && settings.publisherId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, [settings.publisherId, config.id, config.enabled, settings.globalEnabled]);

  if (!settings.globalEnabled || !config.enabled || !config.id || !settings.publisherId) {
    // Show a placeholder in dev mode or if explicitly requested, otherwise null
    return null; 
  }

  return (
    <div className={`w-full overflow-hidden my-4 flex justify-center bg-transparent ${className}`}>
        <div className="text-center w-full">
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={settings.publisherId}
                data-ad-slot={config.id}
                data-ad-format={config.format || 'auto'}
                data-full-width-responsive="true">
            </ins>
        </div>
    </div>
  );
};

export const AdDashboard = () => {
  const { settings, updateSettings, isDashboardOpen, setDashboardOpen } = useAds();

  if (!isDashboardOpen) return null;

  const handlePlacementChange = (key: keyof AdSettings['placements'], field: keyof AdPlacementConfig, value: any) => {
    updateSettings({
      ...settings,
      placements: {
        ...settings.placements,
        [key]: {
          ...settings.placements[key],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-yt-paper border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-green-500">Google AdSense</span> لوحة التحكم
          </h2>
          <button onClick={() => setDashboardOpen(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Global Settings */}
          <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
            <h3 className="font-bold text-gray-200 mb-3">الإعدادات العامة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Publisher ID (ca-pub-xxx)</label>
                <input 
                  type="text" 
                  value={settings.publisherId}
                  onChange={(e) => updateSettings({...settings, publisherId: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white text-sm"
                  placeholder="ca-pub-0000000000000000"
                />
              </div>
              <div className="flex items-end pb-2">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.globalEnabled}
                      onChange={(e) => updateSettings({...settings, globalEnabled: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-900 text-green-600 focus:ring-green-500" 
                    />
                    <span className="text-sm font-medium text-white">تفعيل الإعلانات في الموقع</span>
                 </label>
              </div>
            </div>
          </div>

          {/* Placements */}
          <div className="space-y-3">
             <h3 className="font-bold text-gray-200">أماكن الإعلانات</h3>
             
             {Object.entries(settings.placements).map(([key, config]) => (
               <div key={key} className="bg-black/20 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 items-start md:items-center">
                 <div className="w-full md:w-32 shrink-0">
                    <span className="text-sm font-bold text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <label className="flex items-center gap-2 mt-1 cursor-pointer">
                       <input 
                         type="checkbox"
                         checked={config.enabled}
                         onChange={(e) => handlePlacementChange(key as any, 'enabled', e.target.checked)}
                         className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-blue-500"
                       />
                       <span className="text-xs text-gray-500">{config.enabled ? 'مفعل' : 'معطل'}</span>
                    </label>
                 </div>
                 
                 <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input 
                        type="text"
                        value={config.id}
                        onChange={(e) => handlePlacementChange(key as any, 'id', e.target.value)}
                        placeholder="Slot ID (e.g., 1234567890)"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-600"
                      />
                    </div>
                    <div>
                      <select 
                        value={config.format || 'auto'}
                        onChange={(e) => handlePlacementChange(key as any, 'format', e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-xs text-gray-300"
                      >
                        <option value="auto">Auto</option>
                        <option value="fluid">Fluid</option>
                        <option value="rectangle">Rectangle</option>
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                      </select>
                    </div>
                 </div>
               </div>
             ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-2 bg-gray-900/50 rounded-b-2xl">
          <button 
            onClick={() => setDashboardOpen(false)}
            className="px-4 py-2 bg-white text-black font-bold rounded-lg text-sm hover:bg-gray-200"
          >
            حفظ وإغلاق
          </button>
        </div>

      </div>
    </div>
  );
};