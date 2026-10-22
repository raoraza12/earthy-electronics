import React, { createContext, useState, useEffect, useContext } from 'react';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = async (forceReset = false) => {
    try {
      setLoading(true);
      // 1. Check if admin has made local edits saved in localStorage
      if (!forceReset) {
        const localSaved = localStorage.getItem('demoInventory_v2');
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInventory(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Corrupted demoInventory_v2 in localStorage, fetching fresh data", e);
          }
        }
      }

      // 2. Otherwise fetch from backend or products.json
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      let itemsArray = [];
      try {
        const res = await fetch(`${base}/api/products`);
        if (res.ok) {
          const resData = await res.json();
          itemsArray = Array.isArray(resData) ? resData : resData.data || [];
        }
      } catch (err) {
        console.warn("Backend API unavailable for inventory, loading from local data file");
      }

      if (!itemsArray || itemsArray.length === 0) {
        const localRes = await fetch('/data/products.json');
        const localData = await localRes.json();
        itemsArray = Array.isArray(localData) ? localData : localData.data || [];
      }

      const brokenIds = new Set([471, 447, 507, 465, 760, 1001, 1002, 1003, 1004, 2001, 2002, 2003, 759]);
      itemsArray = itemsArray.filter(p => !brokenIds.has(p.id));

      setInventory(itemsArray);
      localStorage.setItem('demoInventory_v2', JSON.stringify(itemsArray));
    } catch (error) {
      console.error("Failed to load products for inventory", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const resetToDefaultInventory = async () => {
    localStorage.removeItem('demoInventory_v2');
    await loadInventory(true);
  };

  const updateStock = async (productId, newStock) => {
    const stockVal = Math.max(0, parseInt(newStock) || 0);
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      try {
        await fetch(`${base}/api/admin/products/${productId}/stock`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({ stock: stockVal })
        });
      } catch (err) {
        console.warn("Backend unavailable, updating local inventory stock");
      }
      setInventory(prev => {
        const next = prev.map(p => String(p.id) === String(productId) ? { ...p, stock: stockVal } : p);
        localStorage.setItem('demoInventory_v2', JSON.stringify(next));
        return next;
      });
      
      if (stockVal <= 5) {
         alert(`LOW STOCK WARNING: Product ID ${productId} is now at ${stockVal} items.`);
      }
    } catch (err) {
      console.error("Failed to update stock", err);
    }
  };

  const addProduct = async (product) => {
    const newProduct = {
      ...product,
      id: product.id || Date.now(),
      price: Number(product.price) || 0,
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      stock: product.stock !== undefined ? Number(product.stock) : 100,
      stock_threshold: product.stock_threshold !== undefined ? Number(product.stock_threshold) : 5,
      created_at: new Date().toISOString()
    };

    setInventory(prev => {
      const next = [newProduct, ...prev];
      localStorage.setItem('demoInventory_v2', JSON.stringify(next));
      return next;
    });

    // Sync with backend if available
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      await fetch(`${base}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(newProduct)
      });
    } catch (err) {
      console.warn("Backend unavailable for addProduct, saved locally in demoInventory_v2");
    }

    window.dispatchEvent(new Event('inventoryUpdated'));
    return newProduct;
  };

  const updateProduct = async (updatedProduct) => {
    const formatted = {
      ...updatedProduct,
      price: Number(updatedProduct.price) || 0,
      discountPrice: updatedProduct.discountPrice ? Number(updatedProduct.discountPrice) : null,
      stock: updatedProduct.stock !== undefined ? Number(updatedProduct.stock) : 100,
      stock_threshold: updatedProduct.stock_threshold !== undefined ? Number(updatedProduct.stock_threshold) : 5
    };

    setInventory(prev => {
      const next = prev.map(p => String(p.id) === String(formatted.id) ? { ...p, ...formatted } : p);
      localStorage.setItem('demoInventory_v2', JSON.stringify(next));
      return next;
    });

    // Sync with backend if available
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      await fetch(`${base}/api/admin/products/${formatted.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(formatted)
      });
    } catch (err) {
      console.warn("Backend unavailable for updateProduct, saved locally in demoInventory_v2");
    }

    window.dispatchEvent(new Event('inventoryUpdated'));
    return formatted;
  };

  const deleteProduct = async (productId) => {
    setInventory(prev => {
      const next = prev.filter(p => String(p.id) !== String(productId));
      localStorage.setItem('demoInventory_v2', JSON.stringify(next));
      return next;
    });

    // Sync with backend if available
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      await fetch(`${base}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
    } catch (err) {
      console.warn("Backend unavailable for deleteProduct, saved locally in demoInventory_v2");
    }

    window.dispatchEvent(new Event('inventoryUpdated'));
  };

  const deductStock = (productId, amount) => {
    const updated = inventory.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock - amount);
        if (newStock <= 5 && p.stock > 5) {
          window.dispatchEvent(new CustomEvent('lowStockAlert', { detail: { ...p, stock: newStock } }));
        }
        return { ...p, stock: newStock };
      }
      return p;
    });
    setInventory(updated);
    localStorage.setItem('demoInventory_v2', JSON.stringify(updated));
  };

  return (
    <InventoryContext.Provider value={{ 
      inventory, 
      loading, 
      loadInventory,
      resetToDefaultInventory,
      updateStock, 
      deductStock, 
      addProduct, 
      deleteProduct, 
      updateProduct 
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
