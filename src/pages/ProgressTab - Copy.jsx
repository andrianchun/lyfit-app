import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLocalYMD } from '../data/constants';

const ProgressTab = ({ t, lang, language, theme, history, programs, exerciseLibrary, soundEnabled, playSoundEffect }) => {
  const [chartType, setChartType] = useState('exercise'); 
  // REVISI: Ubah default ke 'month'
  const [chartPeriod, setChartPeriod] = useState('month'); 
  const [activeChartLines, setActiveChartLines] = useState([]);

  const chartColors = ['#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e', '#facc15', '#6366f1'];

  const chartDataObj = useMemo(() => {
    const isMusc = chartType === 'muscle';
    const itemsSet = new Set();
    const groupedData = {};

    const exLookup = {};
    programs.forEach(p => p.exercises.forEach(ex => exLookup[ex.id] = ex));
    exerciseLibrary.forEach(ex => exLookup[ex.id] = ex); 

    const now = new Date();
    const msPerDay = 86400000;
    let daysLimit = chartPeriod === 'week' ? 7 : (chartPeriod === 'month' ? 30 : 365);
    const startDate = new Date(now.getTime() - (daysLimit * msPerDay));
    const startStr = getLocalYMD(startDate);

    const filteredHistory = Object.entries(history)
      .filter(([dateStr, data]) => data.status === 'completed' && dateStr >= startStr)
      .sort(([a], [b]) => a.localeCompare(b));

    filteredHistory.forEach(([dateStr, dayData]) => {
      const dateObj = new Date(dateStr);
      const groupKey = chartPeriod === 'year'
        ? dateObj.toLocaleDateString(language==='ID'?'id-ID':'en-US', { month: 'short', year: '2-digit' })
        : dateObj.toLocaleDateString(language==='ID'?'id-ID':'en-US', { day: 'numeric', month: 'short' });

      if (!groupedData[groupKey]) groupedData[groupKey] = { date: groupKey };
      const dataPoint = groupedData[groupKey];

      const log = dayData.log || {};
      const eLogs = log.exerciseLogs || {}; 

      Object.keys(eLogs).forEach(exIdStr => {
        const sets = eLogs[exIdStr];
        const baseId = typeof exIdStr === 'string' && exIdStr.includes('-') ? Number(exIdStr.split('-')[0]) : Number(exIdStr);
        const ex = exLookup[baseId];
        
        if (ex && sets && sets.length > 0) {
          const exName = ex.name;
          const exType = ex.type || 'weight';
          const exTargets = Array.isArray(ex.target) ? ex.target : [ex.target || 'Lainnya'];
          
          let volume = 0; let metricMax = 0;
          
          sets.forEach(s => {
            if (s.done) {
              if (exType === 'weight') {
                 volume += (Number(s.w) * Number(s.r));
                 metricMax = Math.max(metricMax, Number(s.w));
              } else if (exType === 'reps') {
                 volume += Number(s.r);
                 metricMax = Math.max(metricMax, Number(s.r));
              } else if (exType === 'time') {
                 volume += Number(s.d);
                 metricMax = Math.max(metricMax, Number(s.d));
              }
            }
          });

          if (volume > 0) {
            if (isMusc) {
              exTargets.forEach(muscle => { itemsSet.add(muscle); dataPoint[muscle] = (dataPoint[muscle] || 0) + volume; });
            } else {
              itemsSet.add(exName); dataPoint[exName] = Math.max((dataPoint[exName] || 0), metricMax);
            }
          }
        }
      });
    });

    return { data: Object.values(groupedData), items: Array.from(itemsSet) };
  }, [chartType, chartPeriod, language, history, programs, exerciseLibrary]);

  useEffect(() => { 
    setActiveChartLines(chartDataObj.items.slice(0, 3)); 
  }, [chartType, chartDataObj.items.length]);

  const toggleChartLine = (item) => { 
    playSoundEffect('click', soundEnabled); 
    setActiveChartLines(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`${t.bgCard} rounded-xl p-4 border ${t.border} shadow-sm`}>
        <div className="flex justify-between items-center mb-2">
           <h3 className={`${t.textMain} font-bold flex items-center`}><TrendingUp size={20} className={`mr-2 ${t.textAccent}`}/> {lang.progTitle || 'Grafik Progres'}</h3>
           <div className={`flex space-x-1 ${t.inputBg} p-1 rounded-lg`}>
              <button onClick={() => { playSoundEffect('click', soundEnabled); setChartPeriod('week');}} className={`px-2 py-1 rounded text-xs font-bold transition-all ${chartPeriod === 'week' ? t.bgCard + ' ' + t.textAccent + ' shadow-sm' : t.textMuted}`}>{lang.week || 'Minggu'}</button>
              <button onClick={() => { playSoundEffect('click', soundEnabled); setChartPeriod('month');}} className={`px-2 py-1 rounded text-xs font-bold transition-all ${chartPeriod === 'month' ? t.bgCard + ' ' + t.textAccent + ' shadow-sm' : t.textMuted}`}>{lang.month || 'Bulan'}</button>
              <button onClick={() => { playSoundEffect('click', soundEnabled); setChartPeriod('year');}} className={`px-2 py-1 rounded text-xs font-bold transition-all ${chartPeriod === 'year' ? t.bgCard + ' ' + t.textAccent + ' shadow-sm' : t.textMuted}`}>{lang.year || 'Tahun'}</button>
           </div>
        </div>
        <p className={`text-xs ${t.textMuted} mb-4`}>{lang.progDesc || 'Pantau pertumbuhan volume otot & beban.'}</p>
        
        <div className="flex space-x-2 mb-4 border-b border-dashed border-slate-500/30 pb-4">
           <button onClick={() => { playSoundEffect('click', soundEnabled); setChartType('exercise');}} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${chartType === 'exercise' ? t.bgAccent : t.btnBg + ' ' + t.textMuted}`}>{lang.progExercise || 'Per Latihan'}</button>
           <button onClick={() => { playSoundEffect('click', soundEnabled); setChartType('muscle');}} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${chartType === 'muscle' ? t.bgAccent : t.btnBg + ' ' + t.textMuted}`}>{lang.progMuscle || 'Per Otot'}</button>
        </div>
        
        {/* REVISI: Memindahkan container grafik ke atas Multiselect */}
        <div className="h-64 w-full bg-black/5 rounded-lg p-2 mb-4">
          {chartDataObj.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataObj.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#27272a' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="date" stroke={theme === 'dark' ? '#a1a1aa' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={theme === 'dark' ? '#a1a1aa' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} width={35} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', borderColor: theme === 'dark' ? '#27272a' : '#e2e8f0', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                {chartDataObj.items.map((item, idx) => ( activeChartLines.includes(item) && <Line key={item} type="monotone" name={item} dataKey={item} stroke={chartColors[idx % chartColors.length]} strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls={true} /> ))}
              </LineChart>
            </ResponsiveContainer>
          ) : ( 
            <div className="w-full h-full flex items-center justify-center text-sm font-bold opacity-50">Tidak ada data</div> 
          )}
        </div>

        {/* REVISI: Multiselect diletakkan di bawah grafik */}
        <div className="flex flex-wrap gap-2">
          {chartDataObj.items.length === 0 && <span className={`text-xs ${t.textMuted} italic`}>Belum ada data.</span>}
          {chartDataObj.items.map((item, idx) => {
             const isActive = activeChartLines.includes(item); 
             const color = chartColors[idx % chartColors.length];
             return (
               <button key={item} onClick={() => toggleChartLine(item)} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border`} style={{ backgroundColor: isActive ? color : 'transparent', borderColor: color, color: isActive ? '#fff' : color, opacity: isActive ? 1 : 0.6 }}>
                 {item}
               </button>
             )
          })}
        </div>
        
      </div>
    </div>
  );
};

export default ProgressTab;