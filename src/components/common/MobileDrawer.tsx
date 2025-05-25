import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom' | 'top';
  width?: string;
  height?: string;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  showBackdrop?: boolean;
  backdropClassName?: string;
  className?: string;
  contentClassName?: string;
  swipeToClose?: boolean;
  swipeThreshold?: number;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
}

/**
 * Mobile-optimized drawer component with swipe gestures
 */
const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'left',
  width = '80%',
  height = '100%',
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  showBackdrop = true,
  backdropClassName = '',
  className = '',
  contentClassName = '',
  swipeToClose = true,
  swipeThreshold = 0.3,
  onAfterOpen,
  onAfterClose,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isHorizontal = position === 'left' || position === 'right';
  const drawerSize = isHorizontal ? width : height;

  // Handle swipe gestures
  const handleSwipeLeft = () => {
    if (position === 'right' && swipeToClose) {
      onClose();
    }
  };

  const handleSwipeRight = () => {
    if (position === 'left' && swipeToClose) {
      onClose();
    }
  };

  const handleSwipeUp = () => {
    if (position === 'bottom' && swipeToClose) {
      onClose();
    }
  };

  const handleSwipeDown = () => {
    if (position === 'top' && swipeToClose) {
      onClose();
    }
  };

  const { ref: swipeRef } = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown,
  });

  // Handle drag end for more precise control
  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!swipeToClose) return;

    const threshold = swipeThreshold;
    
    if (position === 'left' && info.offset.x < -threshold * parseFloat(width)) {
      onClose();
    } else if (position === 'right' && info.offset.x > threshold * parseFloat(width)) {
      onClose();
    } else if (position === 'top' && info.offset.y < -threshold * parseFloat(height)) {
      onClose();
    } else if (position === 'bottom' && info.offset.y > threshold * parseFloat(height)) {
      onClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    };

    if (closeOnEsc) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  // Handle after open/close effects
  useEffect(() => {
    if (isOpen && onAfterOpen) {
      onAfterOpen();
    }
  }, [isOpen, onAfterOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (onAfterClose) {
        onAfterClose();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onAfterClose]);

  // Variants for animations
  const getVariants = () => {
    switch (position) {
      case 'left':
        return {
          open: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
          closed: { x: '-100%', transition: { type: 'spring', damping: 25, stiffness: 300 } },
        };
      case 'right':
        return {
          open: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
          closed: { x: '100%', transition: { type: 'spring', damping: 25, stiffness: 300 } },
        };
      case 'top':
        return {
          open: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
          closed: { y: '-100%', transition: { type: 'spring', damping: 25, stiffness: 300 } },
        };
      case 'bottom':
        return {
          open: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
          closed: { y: '100%', transition: { type: 'spring', damping: 25, stiffness: 300 } },
        };
      default:
        return {
          open: { x: 0 },
          closed: { x: '-100%' },
        };
    }
  };

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'left':
        return {
          top: 0,
          left: 0,
          bottom: 0,
          width,
          height: '100%',
        };
      case 'right':
        return {
          top: 0,
          right: 0,
          bottom: 0,
          width,
          height: '100%',
        };
      case 'top':
        return {
          top: 0,
          left: 0,
          right: 0,
          height,
          width: '100%',
        };
      case 'bottom':
        return {
          bottom: 0,
          left: 0,
          right: 0,
          height,
          width: '100%',
        };
      default:
        return {};
    }
  };

  // Get drag constraints
  const getDragConstraints = () => {
    if (!swipeToClose) return { top: 0, left: 0, right: 0, bottom: 0 };

    switch (position) {
      case 'left':
        return { top: 0, left: -9999, right: 0, bottom: 0 };
      case 'right':
        return { top: 0, left: 0, right: 9999, bottom: 0 };
      case 'top':
        return { top: -9999, left: 0, right: 0, bottom: 0 };
      case 'bottom':
        return { top: 0, left: 0, right: 0, bottom: 9999 };
      default:
        return { top: 0, left: 0, right: 0, bottom: 0 };
    }
  };

  // Get drag direction
  const getDragDirection = () => {
    return isHorizontal ? 'x' : 'y';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {showBackdrop && (
            <motion.div
              className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${backdropClassName}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOnClickOutside ? onClose : undefined}
            />
          )}

          {/* Drawer */}
          <motion.div
            ref={swipeRef as React.RefObject<HTMLDivElement>}
            className={`fixed z-50 bg-white shadow-lg ${className}`}
            style={getPositionStyles()}
            initial="closed"
            animate="open"
            exit="closed"
            variants={getVariants()}
            drag={swipeToClose ? getDragDirection() : false}
            dragConstraints={getDragConstraints()}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Close button */}
            {showCloseButton && (
              <button
                className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none"
                onClick={onClose}
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            )}

            {/* Content */}
            <div
              ref={contentRef}
              className={`h-full overflow-auto ${contentClassName} ${
                showCloseButton ? 'pt-12' : ''
              }`}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
