'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'rinjani_cart_v1';

/**
 * Runs a smooth parabolic fly-to-cart animation using the Web Animations API.
 * An element spawns at sourceEl coordinates, arches in a curve toward targetEl,
 * shrinks down, and disappears cleanly into the navbar cart icon.
 */
function runFlyToCartAnimation(sourceEl, item, onComplete) {
  try {
    const targetEl =
      document.getElementById('header-cart-btn') ||
      document.querySelector('.header-cart-btn');

    if (!targetEl || !sourceEl) {
      onComplete();
      return;
    }

    const startRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Center coordinates
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const deltaX = targetX - startX;
    const deltaY = targetY - startY;

    // Create flyer container
    const flyer = document.createElement('div');
    flyer.className = 'fly-to-cart-particle';
    flyer.style.width = '54px';
    flyer.style.height = '54px';
    flyer.style.left = `${startX - 27}px`;
    flyer.style.top = `${startY - 27}px`;

    // Image inside flyer
    const img = document.createElement('img');
    img.src =
      item.image ||
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80&fm=webp';
    img.alt = item.name || 'Product';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    flyer.appendChild(img);

    document.body.appendChild(flyer);

    // Calculate curve arch: parabolic throw effect
    const archOffset = Math.min(-70, -Math.abs(deltaX * 0.18) - 50);

    const keyframes = [
      {
        transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
        opacity: 1,
      },
      {
        // Apex of the curve at 45%
        transform: `translate3d(${deltaX * 0.45}px, ${deltaY * 0.3 + archOffset}px, 0) scale(0.92) rotate(-12deg)`,
        opacity: 0.95,
        offset: 0.45,
      },
      {
        // Descending into the cart icon
        transform: `translate3d(${deltaX * 0.8}px, ${deltaY * 0.75 + archOffset * 0.3}px, 0) scale(0.65) rotate(-22deg)`,
        opacity: 0.85,
        offset: 0.75,
      },
      {
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.18) rotate(-32deg)`,
        opacity: 0.1,
      },
    ];

    const animation = flyer.animate(keyframes, {
      duration: 680,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards',
    });

    const cleanupAndDone = () => {
      if (flyer.parentNode) {
        flyer.parentNode.removeChild(flyer);
      }
      onComplete();
    };

    animation.onfinish = cleanupAndDone;
    animation.onerror = cleanupAndDone;
  } catch (err) {
    console.error('Fly animation error:', err);
    onComplete();
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load cart from localStorage on mount (client-side only to avoid SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [cart, isLoaded]);

  // Show temporary toast notification
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Trigger bounce animation on the header cart icon
  const triggerCartBump = useCallback(() => {
    setIsCartBumping(true);
    setTimeout(() => {
      setIsCartBumping(false);
    }, 650);
  }, []);

  // Add item to cart with optional fly-to-cart animation
  const addToCart = useCallback(
    (item, sourceElementOrEvent) => {
      // Resolve source element from event or element
      let sourceEl = null;
      if (sourceElementOrEvent) {
        if (sourceElementOrEvent.currentTarget) {
          sourceEl = sourceElementOrEvent.currentTarget;
        } else if (sourceElementOrEvent.target) {
          sourceEl = sourceElementOrEvent.target;
        } else if (typeof HTMLElement !== 'undefined' && sourceElementOrEvent instanceof HTMLElement) {
          sourceEl = sourceElementOrEvent;
        }
      }

      const performAdd = () => {
        setCart((prevCart) => {
          // For standard catalog products, check if exact variant already exists
          if (item.type === 'product') {
            const existingIndex = prevCart.findIndex(
              (i) =>
                i.type === 'product' &&
                i.slug === item.slug &&
                i.selectedSize === item.selectedSize &&
                i.selectedColor === item.selectedColor
            );

            if (existingIndex > -1) {
              const updated = [...prevCart];
              updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: updated[existingIndex].quantity + (item.quantity || 1),
              };
              return updated;
            }
          }

          // Generate unique ID if not present
          const newItem = {
            ...item,
            id: item.id || `cart_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            addedAt: new Date().toISOString(),
          };

          return [newItem, ...prevCart];
        });

        triggerCartBump();
      };

      if (typeof window !== 'undefined' && sourceEl) {
        runFlyToCartAnimation(sourceEl, item, performAdd);
      } else {
        performAdd();
      }
    },
    [triggerCartBump]
  );

  // Remove item by ID
  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart]);

  // Clear all items in cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Total quantity of units
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Total price in IDR
  const totalPrice = cart.reduce((sum, item) => {
    const priceNum = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    return sum + priceNum * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        isCartOpen,
        setIsCartOpen,
        isCartBumping,
        triggerCartBump,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
