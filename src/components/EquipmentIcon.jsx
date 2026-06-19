import React from 'react';
import { Dumbbell, Database, Activity, User, Target } from 'lucide-react';

const EquipmentIcon = ({ equipment, size = 24, className = "" }) => {
  const eq = (equipment || '').toLowerCase();
  if (eq.includes('body')) return <User size={size} className={className} />;
  if (eq.includes('cardio')) return <Activity size={size} className={className} />;
  if (eq.includes('cable') || eq.includes('machine') || eq.includes('smith')) return <Database size={size} className={className} />;
  if (eq.includes('dumbbell') || eq.includes('barbell') || eq.includes('weight')) return <Dumbbell size={size} className={className} />;
  return <Target size={size} className={className} />;
};

export default EquipmentIcon;
