import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Language } from '../types';

interface LiveViewerCountProps {
  channelId: string;
  groupTitle: string;
  lang: Language;
  className?: string;
  showIcon?: boolean;
}

export default function LiveViewerCount({ 
  channelId, 
  groupTitle, 
  lang, 
  className = '', 
  showIcon = true 
}: LiveViewerCountProps) {
  
  // Safe helper to determine a consistent base viewer count for any channel
  const getBaseViewerCount = (id: string, group: string): number => {
    let hash = 0;
    const testId = id || 'channel-default';
    for (let i = 0; i < testId.length; i++) {
      hash = testId.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    const groupLower = (group || '').toLowerCase();
    let base = 2500; // regular standard base
    
    if (groupLower.includes('world cup') || testId.includes('caze') || testId.includes('fifa')) {
      // soccer streaming mega matches: 250k - 900k viewers
      base = 250000 + (hash % 650000);
    } else if (groupLower.includes('sports') || testId.includes('bein') || testId.includes('tsn') || testId.includes('tyc') || testId.includes('espn') || testId.includes('sports') || testId.includes('dazn')) {
      // general physical match streams: 35k - 155k viewers
      base = 35000 + (hash % 120000);
    } else if (groupLower.includes('entertainment') || groupLower.includes('bangladesh') || testId.includes('zee') || testId.includes('star') || testId.includes('colors') || testId.includes('sony') || testId.includes('jalsha')) {
      // top daily serial channels: 12k - 57k viewers
      base = 12000 + (hash % 45000);
    } else if (groupLower.includes('movies') || testId.includes('goldmines') || testId.includes('jalsha-movies') || testId.includes('south')) {
      // movies stream: 5k - 25k viewers
      base = 5000 + (hash % 20000);
    } else if (groupLower.includes('cartoon') || testId.includes('nick') || testId.includes('tom') || testId.includes('oggy') || testId.includes('gopal') || testId.includes('doraemon') || testId.includes('mr-bean')) {
      // cartoon channels: 3k - 18k viewers
      base = 3000 + (hash % 15000);
    } else if (groupLower.includes('documentary') || testId.includes('discovery') || testId.includes('earth') || testId.includes('planet')) {
      // documentaries: 1.5k - 9.5k viewers
      base = 1500 + (hash % 8000);
    } else {
      // fallback other streams/user custom: 450 - 2950 viewers
      base = 450 + (hash % 2500);
    }
    return base;
  };

  const [count, setCount] = useState<number>(() => getBaseViewerCount(channelId, groupTitle));

  useEffect(() => {
    // Reset immediately if the channel ID is switched
    setCount(getBaseViewerCount(channelId, groupTitle));

    // Fluctuate count by a small multiplier every couple seconds to make it look active
    const timer = setInterval(() => {
      setCount((currentCount) => {
        // Change count slightly: between -1.8% to +1.8%
        const percentVariation = (Math.random() * 3.6 - 1.8) / 100;
        const offset = Math.round(currentCount * percentVariation);
        let updated = currentCount + offset;
        
        // Keep a realistic lower boundary
        if (updated < 120) {
          updated = 120 + Math.floor(Math.random() * 50);
        }
        return updated;
      });
    }, 4500 + Math.random() * 3000); // randomize interval between 4.5s and 7.5s

    return () => clearInterval(timer);
  }, [channelId, groupTitle]);

  // Use current native localization settings for beautifully localized digits formatting
  const formattedCount = count.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold tracking-tight select-none ${className}`}>
      {showIcon && (
        <Eye className="w-3.5 h-3.5 stroke-[2.5] text-amber-400" />
      )}
      <span>
        {formattedCount} {lang === 'bn' ? 'জন সরাসরি দেখছেন' : 'live watching'}
      </span>
    </span>
  );
}
