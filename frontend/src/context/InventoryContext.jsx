import React, { createContext, useState, useEffect, useContext } from 'react';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = async () => {
    try {
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

      setInventory(itemsArray);
    } catch (error) {
      console.error("Failed to load products for inventory", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const updateStock = async (productId, newStock) => {
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
          body: JSON.stringify({ stock: newStock })
        });
      } catch (err) {
        console.warn("Backend unavailable, updating local inventory stock");
      }
      setInventory(prev => prev.map(p => String(p.id) === String(productId) ? { ...p, stock: newStock } : p));
      
      if (newStock <= 5) {
         alert(`LOW STOCK WARNING: Product ID ${productId} is now at ${newStock} items.`);
      }
    } catch (err) {
      console.error("Failed to update stock", err);
    }
  };

  const addProduct = (product) => {
    const newProduct = { ...product, id: product.id || Date.now() };
    setInventory(prev => {
      const next = [newProduct, ...prev];
      localStorage.setItem('demoInventory_v2', JSON.stringify(next));
      return next;
    });
    return newProduct;
  };

  const updateProduct = (updatedProduct) => {
    setInventory(prev => {
      const next = prev.map(p => String(p.id) === String(updatedProduct.id) ? { ...p, ...updatedProduct } : p);
      localStorage.setItem('demoInventory_v2', JSON.stringify(next));
      return next;
    });
  };

  const deleteProduct = (productId) => {
    setInventory(prev => {
      const next = prev.filter(p => String(p.id) !== String(productId));
      localStorage.setItem('demoInventory_v2', JSON.stringify(next));
      return next;
    });
  };

  const deductStock = (productId, amount) => {
    const updated = inventory.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock - amount);
        // Dispatch event for email alert if stock drops to <= 5
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
    <InventoryContext.Provider value={{ inventory, loading, updateStock, deductStock, addProduct, deleteProduct, updateProduct }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
