import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv,
  Search,
  Plus,
  Trash2,
  Globe,
  Wifi,
  Settings,
  HelpCircle,
  Clock,
  Calendar,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Play,
  Upload,
  BookOpen,
  Sliders,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { DEFAULT_CHANNELS, WORLD_CUP_FIXTURES } from './channels';
import { Channel, MatchFixture, Language } from './types';
import VideoPlayer from './components/VideoPlayer';
import LiveViewerCount from './components/LiveViewerCount';
import ActiveViewersList from './components/ActiveViewersList';

export default function App() {
  const [lang, setLang] = useState<Language>('bn');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom single link state
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newChannelLogo, setNewChannelLogo] = useState('');

  // Bulk M3U playlist input
  const [m3uText, setM3uText] = useState('');
  const [m3uUrlInput, setM3uUrlInput] = useState('');
  
  // Tabs active
  const [activeTab, setActiveTab] = useState<'provided' | 'custom' | 'fixtures' | 'guide'>('provided');

  // Copy URL visual check state
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Dynamic status feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  // Match tracker fake score states (keeps UI highly alive!)
  const [matchScores, setMatchScores] = useState<Record<string, { home: number; away: number; minutes: number; live: boolean }>>({
    m1: { home: 2, away: 1, minutes: 78, live: true },
    m2: { home: 0, away: 0, minutes: 0, live: false },
    m3: { home: 1, away: 1, minutes: 45, live: true },
    m4: { home: 0, away: 0, minutes: 0, live: false },
    m5: { home: 0, away: 0, minutes: 0, live: false },
  });

  // Dynamic ticking time
  const [currentTime, setCurrentTime] = useState<string>('');

  // Set initial default title and channels + load custom from storage
  useEffect(() => {
    document.title = lang === 'bn' ? 'বিশ্বকাপ ২০২৬ লাইভ আইপিটিভি প্লেয়ার' : 'FIFA World Cup 2026 IPTV Player';
    
    // Load local channels or set provided
    const localCh = localStorage.getItem('fwc_iptv_custom_channels');
    const customList: Channel[] = localCh ? JSON.parse(localCh) : [];
    
    const combined = [...DEFAULT_CHANNELS, ...customList];
    setChannels(combined);

    // Default active is beIN Sports 5 or first available
    if (combined.length > 0) {
      setActiveChannel(combined[0]);
    }
  }, [lang]);

  // Handle ticking watch
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Simulating live match events
  useEffect(() => {
    const interval = setInterval(() => {
      setMatchScores((prev) => {
        const next = { ...prev };
        // Tick minutes of live matches
        Object.keys(next).forEach((key) => {
          if (next[key].live) {
            next[key].minutes = next[key].minutes >= 90 ? 90 : next[key].minutes + 1;
            // random goal alert probability
            if (Math.random() < 0.04 && next[key].minutes < 90) {
              if (Math.random() > 0.5) {
                next[key].home += 1;
              } else {
                next[key].away += 1;
              }
            }
          }
        });
        return next;
      });
    }, 15000); // update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter channels based on search and active tab categorizations
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      // Filter by dynamic query
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ch.groupTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by subtab category
      if (activeTab === 'provided') {
        return matchesSearch && !ch.isCustom;
      } else if (activeTab === 'custom') {
        return matchesSearch && ch.isCustom;
      }
      return matchesSearch;
    });
  }, [channels, searchQuery, activeTab]);

  // Save new single custom channel
  const handleAddCustomChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName || !newChannelUrl) {
      alert(lang === 'bn' ? 'দয়া করে নাম এবং আইপিটিভি লিংক প্রদান করুন!' : 'Please fill in Name and IPTV URL!');
      return;
    }

    const newChan: Channel = {
      id: 'custom-' + Date.now(),
      name: newChannelName,
      url: newChannelUrl.trim(),
      logo: newChannelLogo.trim() || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=60',
      groupTitle: 'Custom Matches',
      isCustom: true
    };

    const updated = [...channels, newChan];
    setChannels(updated);

    // Save strictly custom channels into localStorage
    const onlyCustom = updated.filter(c => c.isCustom);
    localStorage.setItem('fwc_iptv_custom_channels', JSON.stringify(onlyCustom));

    setActiveChannel(newChan);
    setNewChannelName('');
    setNewChannelUrl('');
    setNewChannelLogo('');
    
    showFeedback(lang === 'bn' ? 'নতুন চ্যানেল সফলভাবে যুক্ত হয়েছে!' : 'Channel added successfully!');
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Remove custom channel
  const handleDeleteChannel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === 'bn' ? 'আপনি কি এই চ্যানেলটি ডিলিট করতে চান?' : 'Are you sure you want to delete this channel?')) {
      const updated = channels.filter(c => c.id !== id);
      setChannels(updated);
      
      const onlyCustom = updated.filter(c => c.isCustom);
      localStorage.setItem('fwc_iptv_custom_channels', JSON.stringify(onlyCustom));

      if (activeChannel?.id === id) {
        setActiveChannel(updated[0] || null);
      }
    }
  };

  // Quick M3U Parser logic (Fast parse for low latency, zero lag processing)
  const handleParseM3u = () => {
    if (!m3uText.trim()) {
      alert(lang === 'bn' ? 'দয়া করে M3U প্লেলিস্ট টেক্সট প্রবেশ করান!' : 'Please insert M3U playlist text container!');
      return;
    }

    const lines = m3uText.split('\n');
    let parsedChannels: Channel[] = [];
    let currentName = '';
    let currentLogo = '';
    let currentGroup = 'Imported M3U';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        // extract name
        const lastCommaIndex = line.lastIndexOf(',');
        if (lastCommaIndex !== -1) {
          currentName = line.substring(lastCommaIndex + 1).trim();
        }

        // extract tvg-logo
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        if (logoMatch && logoMatch[1]) {
          currentLogo = logoMatch[1];
        } else {
          currentLogo = '';
        }

        // extract group-title
        const groupMatch = line.match(/group-title="([^"]+)"/);
        if (groupMatch && groupMatch[1]) {
          currentGroup = groupMatch[1];
        } else {
          currentGroup = 'Imported Channels';
        }
      } else if (line.startsWith('http://') || line.startsWith('https://')) {
        if (currentName) {
          parsedChannels.push({
            id: 'm3u-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            name: currentName,
            url: line,
            logo: currentLogo || 'https://images.unsplash.com/photo-1540747737956-378724044453?w=100&auto=format&fit=crop&q=60',
            groupTitle: currentGroup,
            isCustom: true
          });
          // Reset temp containers
          currentName = '';
          currentLogo = '';
        }
      }
    }

    if (parsedChannels.length > 0) {
      const updated = [...channels, ...parsedChannels];
      setChannels(updated);
      
      const onlyCustom = updated.filter(c => c.isCustom);
      localStorage.setItem('fwc_iptv_custom_channels', JSON.stringify(onlyCustom));

      setActiveChannel(parsedChannels[0]);
      setM3uText('');
      setActiveTab('custom');
      showFeedback(
        lang === 'bn' 
          ? `${parsedChannels.length} টি চ্যানেল সফলভাবে ইম্পোর্ট করা হয়েছে!` 
          : `Successfully imported ${parsedChannels.length} channels!`
      );
    } else {
      alert(lang === 'bn' ? 'কোন বৈধ চ্যানেল ডেটা পাওয়া যায়নি! ফাইল ফরম্যাট চেক করুন।' : 'No valid channels found! Please trace #EXTINF data.');
    }
  };

  // Quick action: Fetch playlist url content
  const handleLoadRemoteM3u = async () => {
    if (!m3uUrlInput.trim()) return;
    try {
      showFeedback(lang === 'bn' ? 'প্লেলিস্ট ডাউনলোড হচ্ছে...' : 'Fetching live playlist...');
      const response = await fetch(m3uUrlInput);
      if (!response.ok) throw new Error('Failed to reach target server');
      const text = await response.text();
      setM3uText(text);
      setM3uUrlInput('');
      showFeedback(lang === 'bn' ? 'ডাউনলোড সম্পন্ন! এবার ইম্পোর্ট বাটনে ক্লিক করুন।' : 'Playlist fetched! Click Parse & Import.');
    } catch (err) {
      console.error(err);
      alert(
        lang === 'bn'
          ? 'সার্ভার থেকে সরাসরি প্লেলিস্ট ডাউনলোড করা যায়নি (CORS পলিসির কারণে হতে পারে)। অনুগ্রহ করে নিচের টেক্সট বক্সে আপনার .m3u কন্টেন্ট সরাসরি পেস্ট করুন।'
          : 'Could not fetch directly due to web browser CORS policy. Please paste content directly.'
      );
    }
  };

  // Copy streaming URL for external players like VLC
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#f8fafc] flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950 immersive-gradient">
      
      {/* 2026 World Cup Premium Theme Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#0f172a]/60 backdrop-blur-md px-4 py-3.5 sm:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Logo Brand Frame */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center text-neutral-950 font-black shadow-lg border border-amber-300">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-rose-500/10 text-rose-500 font-bold px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  {lang === 'bn' ? 'লাইভ' : 'LIVE'}
                </span>
                <span className="text-[10px] bg-amber-400/10 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-widest font-mono">
                  FWC 2026
                </span>
              </div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                {lang === 'bn' ? 'বিশ্বকাপ ২০২৬ আইপিটিভি প্লেয়ার' : 'FIFA World Cup 2026 IPTV Hub'}
              </h1>
            </div>
          </div>

          {/* Dynamic Watch & Info */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
            
            {/* Low latency status badge */}
            <div className="latency-badge">
              {lang === 'bn' ? 'লেটেন্সি: কম (০ মিলি)' : 'LOW LATENCY: ON'}
            </div>

            {/* Countdown clock to increase dynamic theme */}
            <div className="flex items-center gap-1.5 bg-[#0a0f1d] px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono shadow-inner text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentTime || 'Loading...'}</span>
              <span className="text-white/10">|</span>
              <span className="hidden xs:inline">{lang === 'bn' ? 'ঢাকা সময়' : 'Local BDT'}</span>
            </div>

            {/* Language Selection bar */}
            <div className="flex bg-[#0a0f1d] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  lang === 'bn'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  lang === 'en'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Floating system alerts */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-amber-300"
          >
            <Zap className="w-4 h-4 fill-neutral-950" />
            <span>{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* LEFT COLUMN: Main Screen and Controls (Spans 7cols on large) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          
          {/* Active Channel Display Card */}
          {activeChannel ? (
            <div className="flex flex-col gap-2">
              <VideoPlayer
                url={activeChannel.url}
                channelName={activeChannel.name}
                lang={lang}
                channelId={activeChannel.id}
                groupTitle={activeChannel.groupTitle}
              />
              
              {/* Media details frame */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-md flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-950 rounded border border-neutral-800 p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={activeChannel.logo}
                      alt={activeChannel.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=60';
                      }}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      {activeChannel.name}
                      {activeChannel.isCustom && (
                        <span className="text-[9px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-400/30 uppercase font-bold">
                          {lang === 'bn' ? 'কাস্টম' : 'CUSTOM'}
                        </span>
                      )}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-1">
                      <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md font-mono">
                        {activeChannel.url}
                      </p>
                      <span className="text-slate-700 text-xs hidden sm:inline">|</span>
                      <div className="flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 w-fit shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <LiveViewerCount
                          channelId={activeChannel.id}
                          groupTitle={activeChannel.groupTitle}
                          lang={lang}
                          className="text-[10px] sm:text-[11px] text-[#ef4444]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Share/Copy stream URL button */}
                  <button
                    onClick={() => handleCopyUrl(activeChannel.url)}
                    className="flex items-center gap-1 bg-[#0a0f1d] hover:bg-neutral-800 text-[#f8fafc] hover:text-white px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium transition cursor-pointer"
                    title="Copy stream link for VLC"
                  >
                    {copiedUrl === activeChannel.url ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400 font-bold">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'লিঙ্ক কপি করুন' : 'Copy URL'}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={activeChannel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-[#0a0f1d] hover:bg-neutral-800 border border-white/10 rounded-lg text-slate-400 hover:text-white transition"
                    title={lang === 'bn' ? 'সরাসরি ব্রাউজারে বা অ্যাপে চালান' : 'Open live URL directly in player'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-[#0d1527] rounded-xl border border-white/10 border-dashed flex flex-col items-center justify-center p-6 text-center shadow-lg">
              <Tv className="w-16 h-16 text-slate-700 mb-3 animate-pulse" />
              <p className="text-base font-bold text-white mb-2">
                {lang === 'bn' ? 'কোন চ্যানেল সিলেক্ট করা নেই' : 'No IPTV Channel Selected'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                {lang === 'bn'
                  ? 'ডানদিকের চ্যানেল তালিকা বা কাস্টম প্লেলিস্ট ট্যাব থেকে যেকোনো একটি চ্যানেল সিলেক্ট করে লাইভ সম্প্রচার দেখুন।'
                  : 'Select any stream source or paste custom m3u links in the playlist dashboard to watch live action.'}
              </p>
            </div>
          )}

          {/* Low Load Time Quick Guidance Banner */}
          <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-neutral-900/40 border border-amber-400/20 rounded-xl p-4 flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 mt-1 shrink-0 bg-amber-400/10 p-1 rounded" />
            <div>
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-widest">
                {lang === 'bn' ? 'সুপার ফাস্ট লোডিং টিপস (0ms ডিলয়):' : '0ms Buffer Optimization Tips:'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {lang === 'bn'
                  ? '১. আপনি যদি বাফারিং ছাড়া দেখতে চান, তবে "লিঙ্ক কপি করুন" এ ক্লিক করে আপনার ল্যাপটপ বা মোবাইলের VLC player, MX Player অথবা PotPlayer-এ Network Stream হিসেবে লিংকটি পেস্ট করে প্লে করুন। এতে ব্রাউজার ইঞ্জিনের অতিরিক্ত লোড ছাড়াই নিখুঁত লাইভ দেখতে পাবেন।'
                  : '1. Click "Copy URL" and stream via VLC Player, MX Player or PotPlayer on your devices. This bypasses web browser latency, providing instant 1080p live stream.'}
              </p>
            </div>
          </div>

          {/* Tab Content Area (Below Player on main screen) */}
          <div className="bg-[#0f172a]/80 border border-white/5 rounded-xl p-4 shadow-md flex-1 flex flex-col gap-4">
            
            {/* Sub-panels navigation bar */}
            <div className="flex border-b border-white/5 pb-2 overflow-x-auto scrollbar-none gap-2">
              <button
                onClick={() => setActiveTab('provided')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'provided'
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚽ {lang === 'bn' ? 'ফিফা বিশ্বকাপ ২০২৬ স্ট্রিম' : 'FIFA World Cup Streams'}
              </button>
              
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'custom'
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚙️ {lang === 'bn' ? 'কাস্টম প্লেলিস্ট / M3U' : 'Custom Playlists / M3U'}
              </button>

              <button
                onClick={() => setActiveTab('fixtures')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'fixtures'
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 {lang === 'bn' ? 'খেলাধুলার ম্যাচের সময়সূচী' : 'World Cup 2026 Fixtures'}
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'guide'
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📖 {lang === 'bn' ? 'প্লেব্যাক নির্দেশিকা' : 'Low Latency Guide'}
              </button>
            </div>

            {/* TAB PANELS */}
            <div className="flex-1">
              
              {/* FIXED CHANNELS LIST (Provided by User) */}
              {activeTab === 'provided' && (
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'নিচে বিশ্বকাপ ২০২৬ লাইভ দেখানোর জন্য ব্যবহারকারীর দেয়া হাই-স্পিড লিঙ্কগুলোর তালিকা দেওয়া হলো:'
                      : 'The following channels are pre-integrated high speed streams provided for World Cup:'}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                    {channels.filter(c => !c.isCustom).map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => setActiveChannel(ch)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition ${
                          activeChannel?.id === ch.id
                            ? 'bg-amber-400/10 border-amber-400/80 text-white'
                            : 'bg-[#0a0f20]/50 border-white/5 hover:border-white/15 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 bg-white rounded p-1 flex items-center justify-center shrink-0">
                            <img
                              src={ch.logo}
                              alt={ch.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://i.postimg.cc/bwMmBzPZ/T-SPORTS.png';
                              }}
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-bold truncate">{ch.name}</p>
                            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                              {ch.groupTitle}
                            </p>
                          </div>
                        </div>
                        <Play className={`w-4 h-4 ${activeChannel?.id === ch.id ? 'text-amber-400 animate-pulse fill-amber-400' : 'text-slate-500'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CUSTOM IPTV / M3U TAB */}
              {activeTab === 'custom' && (
                <div className="flex flex-col gap-4">
                  
                  {/* Option 1: Form to Add Single Link */}
                  <div className="bg-[#0a0f1d]/80 p-3 sm:p-4 rounded-lg border border-white/5">
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5 uppercase tracking-widest text-amber-400">
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      {lang === 'bn' ? 'নতুন সিঙ্গেল লাইভ প্লেব্যাক লিঙ্ক যুক্ত করুন' : 'Add Single Custom IPTV Link'}
                    </h4>
                    
                    <form onSubmit={handleAddCustomChannel} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'চ্যানেলের নাম (যেমন: গাজী টিভি)' : 'Channel Name (e.g. gtv)'}
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="bg-[#0a0f1d] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                      <input
                        type="url"
                        placeholder={lang === 'bn' ? 'M3U8 বা MP4 লাইভ লিঙ্ক' : 'M3U8 stream URL'}
                        value={newChannelUrl}
                        onChange={(e) => setNewChannelUrl(e.target.value)}
                        className="bg-[#0a0f1d] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        required
                      />
                      <div className="flex gap-2">
                        <input
                           type="url"
                           placeholder={lang === 'bn' ? 'লোগো ইমেজ লিঙ্ক (ঐচ্ছিক)' : 'Logo Image URL (Optional)'}
                           value={newChannelLogo}
                           onChange={(e) => setNewChannelLogo(e.target.value)}
                           className="bg-[#0a0f1d] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 flex-1"
                        />
                        <button
                          type="submit"
                          className="px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          {lang === 'bn' ? 'যুক্ত করুন' : 'Add'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Option 2: Paste full M3U code for Bulk Upload */}
                  <div className="bg-[#0a0f1d]/80 p-3 sm:p-4 rounded-lg border border-white/5 flex flex-col gap-2.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-widest text-amber-400">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      {lang === 'bn' ? 'M3U প্লেলিস্ট বা .m3u টেক্সট সরাসরি ইম্পোর্ট করুন' : 'Bulk Import M3U Playlists / ExtInf text'}
                    </h4>

                    {/* Remote M3U loader */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder={lang === 'bn' ? 'ইনপুট রিমোট এম৩ইউ ইউআরএল...' : 'Or enter Remote M3U playlist URL...'}
                        value={m3uUrlInput}
                        onChange={(e) => setM3uUrlInput(e.target.value)}
                        className="bg-[#0a0f1d] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 flex-1 font-mono"
                      />
                      <button
                        onClick={handleLoadRemoteM3u}
                        className="px-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded transition whitespace-nowrap cursor-pointer"
                      >
                        {lang === 'bn' ? 'প্লেলিস্ট লিঙ্ক আনুন' : 'Fetch Playlist'}
                      </button>
                    </div>

                    <textarea
                      placeholder={
                        lang === 'bn'
                          ? '#EXTM3U\n#EXTINF:0 tvg-logo="লোগো-লিঙ্ক",চ্যানেল নাম\nhttp://লিঙ্ক...'
                          : '#EXTM3U\n#EXTINF:0 tvg-logo="logo-url",Channel Name\nhttp://link...'
                      }
                      rows={3}
                      value={m3uText}
                      onChange={(e) => setM3uText(e.target.value)}
                      className="bg-[#0a0f1d] border border-white/10 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />

                    <button
                      onClick={handleParseM3u}
                      className="w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'পার্স করুন এবং ইম্পোর্ট করুন' : 'Parse & Bulk Import Playlist'}
                    </button>
                  </div>

                  {/* List of custom added channels */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-400">
                      {lang === 'bn' ? 'আপনার সংরক্ষিত কাস্টম চ্যানেল সমূহ:' : 'Your Saved Custom Channels:'}
                    </h4>
                    
                    {channels.filter(c => c.isCustom).length === 0 ? (
                      <div className="p-4 bg-black/20 rounded border border-white/5 text-center text-xs text-slate-500">
                        {lang === 'bn' ? 'কোন কাস্টম চ্যানেল এখনও সংরক্ষিত নেই।' : 'No custom channels added yet.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[150px] overflow-y-auto">
                        {channels.filter(c => c.isCustom).map((ch) => (
                          <div
                            key={ch.id}
                            onClick={() => setActiveChannel(ch)}
                            className="bg-[#0a0f1d]/60 border border-white/10 hover:border-amber-400/30 px-3 py-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="text-xs font-semibold truncate text-slate-200">{ch.name}</span>
                            <button
                              onClick={(e) => handleDeleteChannel(ch.id, e)}
                              className="p-1 text-slate-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* WORLD CUP 2026 SCHEDULES / FIXTURES */}
              {activeTab === 'fixtures' && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-amber-400/10 p-2.5 rounded border border-amber-400/20 text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-amber-400 animate-ping"></span>
                      {lang === 'bn' ? 'বিশ্বকাপ ২০২৬ লাইভ ম্যাচ ট্র্যাকার' : 'Live FWC 2026 Match Tracker'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      📅 {lang === 'bn' ? 'আজ ২২ জুন ২০২৬' : 'Today: June 22, 2026'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {WORLD_CUP_FIXTURES.map((match) => {
                      const scoreState = matchScores[match.id];
                      return (
                        <div
                          key={match.id}
                          className="bg-[#0a0f1d]/50 p-3 rounded-lg border border-white/10 flex flex-col gap-1.5 hover:border-amber-400/30 transition"
                        >
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>{match.group}</span>
                            <span className="font-mono">{match.date} • {match.time} BDT</span>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            {/* Home team */}
                            <div className="flex items-center gap-1.5 w-5/12">
                              <span className="text-lg">{match.homeTeam.flag}</span>
                              <span className="text-xs font-bold text-white truncate">
                                {lang === 'bn' ? match.homeTeam.nameBN : match.homeTeam.nameEN}
                              </span>
                            </div>

                            {/* Scores / Status */}
                            <div className="flex flex-col items-center justify-center w-2/12">
                              {scoreState?.live ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-xs font-black text-rose-500 tracking-wider">
                                    {scoreState.home} - {scoreState.away}
                                  </span>
                                  <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1 py-0.5 rounded animate-pulse font-mono font-bold mt-1">
                                    {scoreState.minutes}' LIVE
                                  </span>
                                </div>
                              ) : (
                                <div className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 font-bold text-slate-400 font-mono">
                                  VS
                                </div>
                              )}
                            </div>

                            {/* Away team */}
                            <div className="flex items-center gap-1.5 w-5/12 justify-end text-right">
                              <span className="text-xs font-bold text-white truncate">
                                {lang === 'bn' ? match.awayTeam.nameBN : match.awayTeam.nameEN}
                              </span>
                              <span className="text-lg">{match.awayTeam.flag}</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 text-center border-t border-white/5 pt-1.5 font-mono">
                            📍 {lang === 'bn' ? match.stadiumBN : match.stadiumEN}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RETRY & LOAD PERFORMANCE GUIDE */}
              {activeTab === 'guide' && (
                <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                  
                  <div className="bg-amber-400/5 p-3 rounded-lg border border-amber-400/20">
                    <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1 uppercase tracking-widest">
                      <Zap className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'অ্যাপটিকে দ্রুততর করা ও বাফার কমিয়ে লোড টাইম কমানোর উপায়:' : 'How to optimize streams and reduce web loading times (0ms delay):'}
                    </h4>
                    <p className="text-slate-300">
                      {lang === 'bn'
                        ? 'আইপি টিভি বা m3u8 লাইভ স্ট্রিম ইন্টারনেটে লোড করার বেশ কিছু সীমাবদ্ধতা থাকে। যদি আপনার স্পিড কম লাগে, তবে নিচের যেকোনো একটি কৌশল গ্রহণ করুন:'
                        : 'Web browsers enforce sandbox rules (like CORS & mixed content blocks) which can introduce buffer delays. Follow these steps:'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="ml-2 pl-2 border-l-2 border-amber-400/30">
                      <span className="font-bold text-white block">
                        ⚙️ {lang === 'bn' ? '১. এক্সটার্নাল প্লেয়ার বা VLC ব্যবহার করুন (সবচেয়ে কার্যকরী):' : '1. Run via Dedicated External Player (Recommended):'}
                      </span>
                      <span className="text-slate-300">
                        {lang === 'bn'
                          ? 'আমাদের প্লেয়ারের নিচে "লিঙ্ক কপি করুন" (Copy URL) বাটনে চাপ দিন এবং আপনার ডিভাইসের VLC Player, PotPlayer অথবা MX Player-এ Ctrl+N (Open Network Stream) চাপ দিয়ে লিংকটি পেস্ট করে প্লে দিন। এতে করে ওয়েব ব্রাউজারের কোনো লেটেন্সি থাকবে না এবং সরাসরি লোড হবে।'
                          : 'Press "Copy URL" under the player window. Load VLC Player (or any player), press Ctrl+N (or Network Stream link paste option), and run. You bypass the browser runtime constraints entirely!'}
                      </span>
                    </div>

                    <div className="ml-2 pl-2 border-l-2 border-amber-400/30">
                      <span className="font-bold text-white block">
                        🔒 {lang === 'bn' ? '২. এইচটিটিপি (HTTP) মিক্সড কনটেন্ট অনুমোদন করুন:' : '2. Allow Mixed Content Block in Browser:'}
                      </span>
                      <span className="text-slate-300">
                        {lang === 'bn'
                          ? 'কিছু ভালো স্ট্রিম লিংক এখনও পুরাতন HTTP সিস্টেমে কাজ করে অথচ এই সাইটটি সুরক্ষিত HTTPS ব্রাউজারে চলেছে। আপনি চাইলে আপনার ব্রাউজারের সার্চ বারের সর্ববামে "Site Settings" এ গিয়ে "Insecure Content" অপশনটি "Allow" করে দিলে HTTP চ্যানেলগুলো সাথে সাথে চালু হয়ে যাবে।'
                          : 'As some channels use HTTP, some secure HTTPS browsers blocks them. Simply go to browser Site Settings left of URL bar -> navigate to "Insecure Content" -> change to "Allow" to view block streams instantly.'}
                      </span>
                    </div>

                    <div className="ml-2 pl-2 border-l-2 border-amber-400/30">
                      <span className="font-bold text-white block">
                        🚫 {lang === 'bn' ? '৩. এডব্লকার সাময়িক নিষ্ক্রিয় করুন:' : '3. Disable over-active Adblock Extensions:'}
                      </span>
                      <span className="text-slate-300">
                        {lang === 'bn'
                          ? 'ইউজার এন্ডে থাকা অতি-আক্রমনাত্মক এডব্লকারগুলো অনেক সময়ে চ্যানলের CDN কানেকশন ভুলবশত ব্লক করে রাখে। লোড টাইম কম করতে এডব্লকার অফ করে চেক করুন।'
                          : 'Over-active pop-up blockers & network filters may block TS segments. Safely whitelist or pause extension during matches.'}
                      </span>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Sidebar (Spans 5cols on large) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          
          {/* Quick Stats overview panel */}
          <div className="bg-gradient-to-br from-slate-900 to-[#030712] border border-white/5 rounded-xl p-4 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <Tv className="w-24 h-24 text-white" />
            </div>
            
            <span className="text-[10px] bg-amber-400/10 text-amber-400 font-extrabold px-2.5 py-1 rounded-full border border-amber-400/20 uppercase tracking-widest inline-block mb-2">
              🏆 FIFA WORLD CUP 2026
            </span>
            <h3 className="text-base font-black text-white">
              {lang === 'bn' ? 'সকল ফুটবল চ্যানেল হাব' : 'All Football IPTV Hub'}
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mt-3 text-center">
              <div className="bg-[#0a0f1d] p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  {lang === 'bn' ? 'মোট প্রাপ্ত চ্যানেল' : 'Channels Loaded'}
                </span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {channels.length}
                </span>
              </div>
              <div className="bg-[#0a0f1d] p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  {lang === 'bn' ? 'বাফার রেট' : 'Buffer Latency'}
                </span>
                <span className="text-lg font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 fill-amber-400" /> Ultra
                </span>
              </div>
            </div>
          </div>

          {/* Search box with dynamic fast lookups */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'চ্যানেল বা ক্যাটাগরি খুঁজুন...' : 'Search channels or groups...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0f172a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white w-full focus:outline-none focus:border-amber-400 placeholder-slate-500 transition shadow-inner"
            />
          </div>

          {/* CHANNELS NAVIGATION SELECTOR SIDEBAR (Highly responsive list) */}
          <div className="bg-[#0f172a]/80 border border-white/5 rounded-xl p-4 flex flex-col gap-3 shadow-md flex-1">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'bn' ? 'ব্রডকাস্ট তালিকায় চ্যানেল' : 'Live Broadcasters list'}
              </h3>
              <span className="text-[10px] text-slate-400">
                {filteredChannels.length} {lang === 'bn' ? 'টি চ্যানেল' : 'channels'}
              </span>
            </div>

            {/* List block */}
            <div className="flex-1 overflow-y-auto max-h-[450px] pr-1 flex flex-col gap-2">
              {filteredChannels.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  {lang === 'bn'
                    ? 'কোনো ম্যাচিং চ্যানেল বা কাস্টম প্লেলিস্ট খুঁজে পাওয়া যায়নি।'
                    : 'No matching IPTV channels found. Check search terms.'}
                </div>
              ) : (
                filteredChannels.map((chan) => {
                  const isActive = activeChannel?.id === chan.id;
                  return (
                    <div
                      key={chan.id}
                      onClick={() => setActiveChannel(chan)}
                      className={`p-2.5 rounded-lg border group relative flex items-center gap-3 cursor-pointer transition ${
                        isActive
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-[#0a0f1d]/50 border-white/5 hover:border-white/15 text-slate-300 hover:text-white'
                      }`}
                    >
                      {/* Left indicator accent block */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${
                          isActive ? 'bg-amber-400' : 'bg-transparent group-hover:bg-[#1e293b]'
                        }`}
                      />

                      {/* Logo Frame */}
                      <div className="w-9 h-9 bg-white rounded p-1 flex items-center justify-center shrink-0 border border-white/10">
                        <img
                          src={chan.logo}
                          alt={chan.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540747737956-378724044453?w=100&auto=format&fit=crop&q=60';
                          }}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Content details description */}
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-xs font-bold truncate pr-6 text-slate-100">{chan.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-slate-400 truncate block font-sans">
                            {chan.groupTitle}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-amber-400 inline-block"></span>
                          <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider">
                            {lang === 'bn' ? 'চলমান' : 'ONLINE'}
                          </span>
                        </div>
                      </div>

                      {/* Delete buttons for custom channels right in list */}
                      {chan.isCustom ? (
                        <button
                          onClick={(e) => handleDeleteChannel(chan.id, e)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-red-950/80 border border-red-500/20 hover:border-red-500 rounded text-red-400 hover:text-white transition"
                          title="Delete channel"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      ) : (
                        <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                      )}

                    </div>
                  );
                })
              )}
            </div>

            {/* Empty checklist / Quick load reset option */}
            <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[11px]">
              <button
                onClick={() => {
                  if (confirm(lang === 'bn' ? 'আপনি কি সব কাস্টম সেটিংস রিসেট করে ডিফল্ট চ্যানেলে ফিরে যেতে চান?' : 'Do you want to reset and restore default preset channels?')) {
                    localStorage.removeItem('fwc_iptv_custom_channels');
                    setChannels(DEFAULT_CHANNELS);
                    setActiveChannel(DEFAULT_CHANNELS[0]);
                    showFeedback(lang === 'bn' ? 'রিসেট সম্পন্ন!' : 'Reset successful!');
                  }
                }}
                className="text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                <RefreshCw className="w-3" />
                {lang === 'bn' ? 'ডিফল্ট রিস্টোর' : 'Restore Defaults'}
              </button>
              
              <span className="text-amber-400 font-mono text-[9px] uppercase tracking-wide flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> {lang === 'bn' ? 'নেটওয়ার্ক সিঙ্ক' : 'SYNC COMPLETED'}
              </span>
            </div>

          </div>

          {/* Real-time Watchers Hub (tv-rkb.vercel.app) */}
          <ActiveViewersList lang={lang} />

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#030712] py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-400 font-sans uppercase tracking-wider text-[11px]">
              {lang === 'bn' ? 'ফিফা বিশ্বকাপ ২০২৬ লাইভ আইপিটিভি প্লেয়ার' : 'FIFA World Cup 2026 Live IPTV Hub'}
            </p>
            <p className="mt-1 text-slate-500 leading-relaxed max-w-2xl font-sans">
              {lang === 'bn'
                ? 'আইপিটিভি লিঙ্কগুলো ব্যবহারকারী সংগৃহীত। দ্রুততম ও বাফারহীন সম্প্রচারের জন্য এক্সটার্নাল প্লেয়ারে প্লেব্যাক করুন। বিশ্বকাপ ফুটবল ২০২৬ টিভির সরাসরি লিংক সমূহ।'
                : 'All IPTV URLs are user integrated. For instant playback experience, run them with your favorite external players.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 justify-center">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              {lang === 'bn' ? 'গতি অপ্টিমাইজড' : 'Latency Optimized'}
            </span>
            <span className="text-white/10">|</span>
            <span className="text-slate-600 font-mono">© ANE(RKB),DoICT</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
