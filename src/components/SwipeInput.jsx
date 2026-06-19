import React, { useState, useEffect, useRef } from 'react';
import { playSoundEffect } from '../utils/audio';

const SwipeInput = ({ value, onChange, disabled, step = 1, className, min = 0, soundEnabled, placeholder }) => {
    const inputRef = useRef(null);
    const dragRef = useRef({ isDragging: false, startY: 0, startVal: 0, lastCalculatedValue: undefined });
    const [isFocused, setIsFocused] = useState(false);
    const [isGlow, setIsGlow] = useState(false);
    
    // STATE LOKAL: Untuk render 60fps tanpa menunggu parent re-render
    const [localValue, setLocalValue] = useState(value);

    // SINKRONISASI: Update localValue jika parent mengubah prop value
    useEffect(() => {
        if (!dragRef.current.isDragging) {
            setLocalValue(value);
        }
    }, [value]);

    useEffect(() => {
       if (dragRef.current.isDragging) return;
       setIsGlow(true);
       const timer = setTimeout(() => setIsGlow(false), 300);
       return () => clearTimeout(timer);
    }, [value]);

    const onTouchStart = (e) => {
        if (disabled) return; 
        e.stopPropagation(); // Mencegah global swipe
        
        let sVal = Number(localValue);
        if ((localValue === '' || localValue === null || localValue === undefined) && placeholder) {
            sVal = Number(placeholder.toString().replace(/[^\d.-]/g, '')) || 0;
        }
        
        // lastCalculatedValue di-reset ke undefined agar sekadar nge-tap tidak otomatis mengisi angka placeholder
        dragRef.current = { isDragging: true, startY: e.touches[0].clientY, startVal: sVal, lastCalculatedValue: undefined };
    };

    const onTouchMove = (e) => {
        if (!dragRef.current.isDragging || disabled) return;
        e.stopPropagation(); // Mencegah global swipe
        
        const diffY = dragRef.current.startY - e.touches[0].clientY;
        const steps = Math.round(diffY / 15); 
        let newValue = dragRef.current.startVal + (steps * step);
        newValue = Math.max(min, Number(newValue.toFixed(2))); 
        
        if (newValue !== Number(localValue)) {
            dragRef.current.lastCalculatedValue = newValue;
            setLocalValue(newValue); // Update UI lokal secara instan
            playSoundEffect('swipe', soundEnabled);
        }
    };

    const onTouchEnd = () => {
        if (dragRef.current.isDragging) {
            dragRef.current.isDragging = false;
            // Baru lempar ke parent (re-render berat) SAAT JARI DIANGKAT (dan jika ada perubahan dari drag)
            if (dragRef.current.lastCalculatedValue !== undefined && dragRef.current.lastCalculatedValue !== Number(value)) {
                onChange(dragRef.current.lastCalculatedValue);
            }
        }
    };

    const handleManualChange = (e) => {
        let val = e.target.value;
        val = val.replace(/^0+(?=\d)/, '');
        if (val === '') val = '0';
        setLocalValue(val);
        onChange(val);
    };

    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        const handleMove = (e) => {
            if (dragRef.current.isDragging) e.preventDefault();
        };
        el.addEventListener('touchmove', handleMove, { passive: false });
        return () => el.removeEventListener('touchmove', handleMove);
    }, []);

    return (
        <div className="relative w-full h-full flex items-center">
            <input
                ref={inputRef}
                type="number"
                style={{ touchAction: 'none' }}
                value={(localValue ?? '').toString().replace(/^0+(?=\d)/, '')} 
                onChange={handleManualChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                placeholder={placeholder}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
                className={`${className} ${isGlow ? 'flash-glow' : ''}`}
            />
        </div>
    );
};

export default SwipeInput;