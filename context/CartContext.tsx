import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "@/types";

export type CartFlavor = {
  id: number;
  name: string;
  quantity: number;
};

export type CartVariant = {
  id: number;
  name: string;
  unit_count: number;
  max_flavors: number;
  price: number;
};

export type CartItem = {
  key: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  variant?: CartVariant | null;
  flavors?: CartFlavor[];
};

type CartContextType = {
  items: CartItem[];
  addItem: (
    product: Product,
    options?: {
      quantity?: number;
      unitPrice?: number;
      variant?: CartVariant | null;
      flavors?: CartFlavor[];
    }
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as CartItem[];
            setItems(Array.isArray(parsed) ? parsed : []);
          } catch {
            setItems([]);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items]);

  const addItem = (
    product: Product,
    options: {
      quantity?: number;
      unitPrice?: number;
      variant?: CartVariant | null;
      flavors?: CartFlavor[];
    } = {}
  ) => {
    const quantity = options.quantity ?? 1;
    const unitPrice = options.unitPrice ?? Number(product.price ?? 0);
    const variant = options.variant ?? null;
    const flavors = options.flavors ?? [];
    const flavorKey = flavors
      .map((flavor) => `${flavor.id}:${flavor.quantity}`)
      .sort()
      .join("|");
    const itemKey = `${product.id}:${variant?.id ?? "base"}:${flavorKey}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.key === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          key: itemKey,
          product,
          quantity,
          unitPrice,
          variant,
          flavors,
        },
      ];
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.key !== key);
      }
      return prev.map((item) => (item.key === key ? { ...item, quantity } : item));
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clear = () => {
    setItems([]);
  };

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return ctx;
}
