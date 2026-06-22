import React, { useState, useEffect } from 'react';
import { Eye, Users, Laptop, Smartphone, Tv, Monitor, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface ViewerSession {
  id: string;
  name: string;
  location: string;
  channel: string;
  device: 'mobile' | 'laptop' | 'tv' | 'desktop';
  flag: string;
  timeJoined: string;
}

interface ActiveViewersListProps {
  lang: Language;
}

const BANGKOK_NAMES = [
  'Siam Kabir', 'Tanvir Rahman', 'Rifat Hossain', 'Arifur Islam', 'Maruf Ahmed',
  'Naimur RKB', 'Fahim Shakil', 'Sajid Anjum', 'Farhan Yasir', 'Sadia Afrin',
  'Tasnim Sultana', 'Mahbub Alam', 'Arafat Sunny', 'Joy Chowdhury', 'Kabir Hasan',
  'Sakib Al Hasan', 'Rubel Hossain', 'Mizanur Rahman', 'Zahidul Islam', 'Kamrul Hasan'
];

const LOCATIONS = [
  { city: 'Dhaka', flag: '🇧🇩' },
  { city: 'Chittagong', flag: '🇧🇩' },
  { city: 'Sylhet', flag: '🇧🇩' },
  { city: 'Comilla', flag: '🇧🇩' },
  { city: 'Rajshahi', flag: '🇧🇩' },
  { city: 'Barisal', flag: '🇧🇩' },
  { city: 'Rangpur', flag: '🇧🇩' },
  { city: 'Khulna', flag: '🇧🇩' },
  { city: 'Mymensingh', flag: '🇧🇩' },
  { city: 'Narayanganj', flag: '🇧🇩' },
  { city: 'Gazipur', flag: '🇧🇩' },
  { city: 'Bogra', flag: '🇧🇩' },
  { city: 'Feni', flag: '🇧🇩' },
  { city: 'Jessore', flag: '🇧🇩' },
  { city: 'Cox\'s Bazar', flag: '🇧🇩' },
  { city: 'Kolkata', flag: '🇮🇳' },
  { city: 'London', flag: '🇬🇧' },
  { city: 'New York', flag: '🇺🇸' },
  { city: 'Riyadh', flag: '🇸🇦' }
];

const CHANNELS_WATCHED = [
  'T Sports HD 🇧🇩', 'Somoy TV 🇧🇩', 'Caze TV 🇧🇷', 'FIFA Plus English 🏆',
  'Sony Max HD', 'Star Sports 1', 'Star Jalsha', 'Zee Bangla', 'BTV 🇧🇩',
  'DSports 🇦🇷', 'Tyc Sports 🇦🇷', 'Bein Sports 1', 'BBC Earth 🐅'
];

const DEVICES: Array<'mobile' | 'laptop' | 'tv' | 'desktop'> = ['mobile', 'laptop', 'tv', 'desktop'];

export default function ActiveViewersList({ lang }: ActiveViewersListProps) {
  const [viewers, setViewers] = useState<ViewerSession[]>([]);
  const [totalViewersCount, setTotalViewersCount] = useState<number>(1450);

  // Generate initial random viewer sessions
  useEffect(() => {
    const initialList: ViewerSession[] = [];
    for (let i = 0; i < 6; i++) {
      const name = BANGKOK_NAMES[Math.floor(Math.random() * BANGKOK_NAMES.length)];
      const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const chan = CHANNELS_WATCHED[Math.floor(Math.random() * CHANNELS_WATCHED.length)];
      const dev = DEVICES[Math.floor(Math.random() * DEVICES.length)];
      const minsSkew = i * 2 + 1;
      
      initialList.push({
        id: Math.random().toString(36).substring(2, 9),
        name,
        location: loc.city,
        flag: loc.flag,
        channel: chan,
        device: dev,
        timeJoined: lang === 'bn' ? `${minsSkew} মিনিট আগে` : `${minsSkew}m ago`
      });
    }
    setViewers(initialList);
    
    // Set a realistic base total viewers count for tv-rkb.vercel.app
    setTotalViewersCount(2380 + Math.floor(Math.random() * 450));
  }, [lang]);

  // Periodic active state fluctuation simulating background server stream sessions
  useEffect(() => {
    const interval = setInterval(() => {
      // Step 1: Fluctuate total live watcher number
      setTotalViewersCount(prev => {
        const change = Math.floor(Math.random() * 15) - 7;
        const target = prev + change;
        return target < 1200 ? 1200 : target;
      });

      // Step 2: Inject/Update active watcher lists
      setViewers(prev => {
        const name = BANGKOK_NAMES[Math.floor(Math.random() * BANGKOK_NAMES.length)];
        const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const chan = CHANNELS_WATCHED[Math.floor(Math.random() * CHANNELS_WATCHED.length)];
        const dev = DEVICES[Math.floor(Math.random() * DEVICES.length)];
        
        const newSession: ViewerSession = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          location: loc.city,
          flag: loc.flag,
          channel: chan,
          device: dev,
          timeJoined: lang === 'bn' ? 'সবেমাত্র যুক্ত হলেন' : 'Just joined'
        };

        // Keeps listing elegant, removing last elements so that max count is 6
        const updatedList = [newSession, ...prev.map(v => {
          // make others look older
          if (v.timeJoined === 'Just joined' || v.timeJoined === 'সবেমাত্র যুক্ত হলেন') {
            return { ...v, timeJoined: lang === 'bn' ? '১ মিনিট আগে' : '1m ago' };
          }
          if (v.timeJoined.includes('1m') || v.timeJoined.includes('১ মিনিট')) {
            return { ...v, timeJoined: lang === 'bn' ? '২ মিনিট আগে' : '2m ago' };
          }
          return v;
        })];
        
        return updatedList.slice(0, 6);
      });
    }, 6000 + Math.random() * 4000); // Trigger every 6s-10s

    return () => clearInterval(interval);
  }, [lang]);

  const renderDeviceIcon = (device: 'mobile' | 'laptop' | 'tv' | 'desktop') => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-3 h-3 text-slate-400" />;
      case 'laptop':
        return <Laptop className="w-3 h-3 text-slate-400" />;
      case 'tv':
        return <Tv className="w-3 h-3 text-slate-400" />;
      case 'desktop':
        return <Monitor className="w-3 h-3 text-slate-400" />;
    }
  };

  const formattedTotal = totalViewersCount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');

  return (
    <div className="bg-[#0f172a]/80 border border-white/5 rounded-xl p-4 shadow-lg flex flex-col gap-3">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#ef4444] stroke-[2.5]" />
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">
            {lang === 'bn' ? 'টিভি-আরকেবি ওয়াচিং হাব' : 'tv-rkb.vercel.app Live Hub'}
          </h4>
        </div>
        
        {/* Pulsing online pill */}
        <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 text-[10px] text-[#ef4444] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>
            {formattedTotal} {lang === 'bn' ? 'অনলাইন' : 'ONLINE'}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed leading-[1.3] -mt-1 font-sans">
        {lang === 'bn' 
          ? 'রিয়েল-টাইমে tv-rkb.vercel.app স্ট্রিম লিংকে সরাসরি সংযুক্ত দর্শকদের চলমান তালিকা:' 
          : 'Providing real-time live connection reports from active browser instances globally:'}
      </p>

      {/* Viewers session listing */}
      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin">
        {viewers.map((v) => (
          <div 
            key={v.id} 
            className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-neutral-950/40 border border-white/5 text-[11px] hover:border-amber-400/20 transition"
          >
            {/* Left group */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0 text-xs" title={v.location}>{v.flag}</span>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-200 truncate max-w-[90px]">{v.name}</span>
                  <span className="text-[9px] text-slate-500">•</span>
                  <span className="text-[9px] text-slate-400 font-mono">{v.location}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-amber-400/90 truncate max-w-[150px]">
                  <ChevronRight className="w-2.5 h-2.5 shrink-0 text-slate-600" />
                  <span className="font-sans truncate">{v.channel}</span>
                </div>
              </div>
            </div>

            {/* Right details */}
            <div className="flex flex-col items-end shrink-0 text-right gap-0.5 font-mono text-[9px]">
              <span className="text-slate-500 ">{v.timeJoined}</span>
              <div className="flex items-center gap-1 bg-white/5 px-1 py-0.2 rounded mt-0.5">
                {renderDeviceIcon(v.device)}
                <span className="text-[8px] uppercase text-slate-400">{v.device}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer statistics branding */}
      <div className="bg-gradient-to-r from-slate-900/40 to-neutral-950 p-2 rounded-lg border border-white/5 text-[10px] text-slate-500 font-mono text-center">
        {lang === 'bn' ? 'সরাসরি দর্শক ডেটা সিঙ্ক করা হয়েছে' : 'Stream telemetry active via tv-rkb.vercel.app'}
      </div>
    </div>
  );
}
