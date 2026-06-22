import React from 'react';
import { Dumbbell, Database, Activity, User, Target, Circle, Anchor } from 'lucide-react';

const EquipmentIcon = ({ equipment, size = 24, className = "" }) => {
  const eq = (equipment || '').toLowerCase();
  
  if (eq.includes('body')) return <User size={size} className={className} />;
  
  if (eq.includes('bike') || eq.includes('elliptical') || eq.includes('stepmill') || eq.includes('skierg') || eq.includes('ergometer')) {
    return <Activity size={size} className={className} />;
  }
  
  if (eq.includes('cable') || eq.includes('machine') || eq.includes('smith') || eq.includes('assisted')) {
    return <Database size={size} className={className} />;
  }
  
  if (eq.includes('bell') || eq.includes('bar') || eq.includes('weight') || eq.includes('hammer')) {
    return <Dumbbell size={size} className={className} />;
  }

  if (eq.includes('ball') || eq.includes('roller') || eq.includes('tire')) {
    return <Circle size={size} className={className} />;
  }

  if (eq.includes('band') || eq.includes('rope')) {
    return <Anchor size={size} className={className} />;
  }

  return <Target size={size} className={className} />;
};

export default EquipmentIcon;
