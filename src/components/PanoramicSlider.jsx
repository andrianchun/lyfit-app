import React, { useRef, useEffect, useState } from 'react';

const PanoramicSlider = ({ onSwipeLeft, onSwipeRight, renderPanel, swipeThreshold = 0.5, onUpSwipe, onDownSwipe }) => {
  const scrollRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const isResetting = useRef(false);

  // Touch tracking to prevent mid-drag resets
  const isTouching = useRef(false);

  // Vertical swipe detection
  const touchStartY = useRef(null);
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    isTouching.current = true;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    isTouching.current = false;
    if (touchStartY.current === null || touchStartX.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const distanceY = touchStartY.current - touchEndY;
    const distanceX = touchStartX.current - touchEndX;

    if (Math.abs(distanceY) > 40 && Math.abs(distanceY) > Math.abs(distanceX)) {
      if (distanceY > 0 && onUpSwipe) onUpSwipe();
      if (distanceY < 0 && onDownSwipe) onDownSwipe();
    }
  };

  useEffect(() => {
    if (scrollRef.current && !isReady) {
      scrollRef.current.scrollLeft = scrollRef.current.clientWidth;
      setIsReady(true);
    }
  }, [isReady]);

  // Handle window resize to keep it centered
  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.clientWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = (e) => {
    // DO NOT reset if the user is still actively dragging
    if (!isReady || isResetting.current || isTouching.current) return;
    
    const el = e.currentTarget;
    const cw = el.clientWidth;
    if (cw === 0) return;

    // Wait for the browser's native scroll-snap to reach the end of the panel
    if (el.scrollLeft <= 1) {
      isResetting.current = true;
      onSwipeRight();
      
      // Instant momentum kill trick
      el.style.overflowX = 'hidden';
      el.scrollLeft = cw;
      void el.offsetHeight; // Force reflow
      el.style.overflowX = 'auto';
      
      setTimeout(() => { isResetting.current = false; }, 30);
    } else if (el.scrollLeft >= cw * 2 - 1) {
      isResetting.current = true;
      onSwipeLeft();
      
      // Instant momentum kill trick
      el.style.overflowX = 'hidden';
      el.scrollLeft = cw;
      void el.offsetHeight; // Force reflow
      el.style.overflowX = 'auto';
      
      setTimeout(() => { isResetting.current = false; }, 30);
    }
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full ${isReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
      style={{ scrollBehavior: 'auto', touchAction: 'pan-x pan-y' }}
    >
      <div className="w-full shrink-0 snap-center flex flex-col justify-start">
        {renderPanel('prev')}
      </div>
      <div className="w-full shrink-0 snap-center flex flex-col justify-start">
        {renderPanel('curr')}
      </div>
      <div className="w-full shrink-0 snap-center flex flex-col justify-start">
        {renderPanel('next')}
      </div>
    </div>
  );
};

export default PanoramicSlider;
