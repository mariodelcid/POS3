import React, { useEffect, useMemo, useState } from 'react';

function centsToUSD(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function POS() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]); // {itemId, name, priceCents, quantity}
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tender, setTender] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('SNACKS');

  useEffect(() => {
    fetch('/api/items').then((r) => r.json()).then(setItems);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category).push(it);
    }
    
    // Define the order for SNACKS items
    const snacksOrder = [
      'Elote chico',
      'Elote Grande', 
      'Elote Entero',
      'Takis',
      'Cheetos',
      'Conchitas',
      'Tostitos'
    ];
    
    // Sort categories to put SNACKS first
    const sortedCategories = Array.from(map.entries()).sort(([a], [b]) => {
      if (a === 'SNACKS') return -1;
      if (b === 'SNACKS') return 1;
      return a.localeCompare(b);
    });
    
    return sortedCategories.map(([category, list]) => {
      let sortedList = list;
      
      // Sort SNACKS items in specific order
      if (category === 'SNACKS') {
        sortedList = list.sort((a, b) => {
          const aIndex = snacksOrder.indexOf(a.name);
          const bIndex = snacksOrder.indexOf(b.name);
          
          // If both items are in the order list, sort by their position
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          // If only one is in the order list, prioritize it
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          // If neither is in the order list, sort alphabetically
          return a.name.localeCompare(b.name);
        });
      } else {
        // For other categories, sort alphabetically
        sortedList = list.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      return { category, list: sortedList };
    });
  }, [items]);

  const subtotalCents = cart.reduce((s, l) => s + l.priceCents * l.quantity, 0);
  const taxCents = Math.round(subtotalCents * 0.0825); // 8.25% tax
  const totalCents = subtotalCents + taxCents;
  const tenderCents = Math.round(parseFloat(tender || '0') * 100);
  const changeCents = paymentMethod === 'cash' ? Math.max(0, tenderCents - totalCents) : 0;

  // Get current category items
  const currentCategoryItems = grouped.find(g => g.category === selectedCategory)?.list || [];

  function addToCart(item) {
    setCart((prev) => {
      const found = prev.find((l) => l.itemId === item.id);
      if (found) {
        return prev.map((l) => (l.itemId === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { itemId: item.id, name: item.name, priceCents: item.priceCents, quantity: 1 }];
    });
  }

  function updateQty(itemId, delta) {
    setCart((prev) => prev
      .map((l) => (l.itemId === itemId ? { ...l, quantity: Math.max(0, l.quantity + delta) } : l))
      .filter((l) => l.quantity > 0));
  }

  function removeFromCart(itemId) {
    setCart((prev) => prev.filter((l) => l.itemId !== itemId));
  }

  // Function to play cash drawer sound
  function playCashDrawerSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  }

  async function completeOrder() {
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
          paymentMethod,
          amountTenderedCents: paymentMethod === 'cash' ? tenderCents : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete order');
      setMessage(`Sale ${data.saleId} complete. Total ${centsToUSD(data.totalCents)}${paymentMethod === 'cash' ? `, Change ${centsToUSD(data.changeDueCents)}` : ''}`);
      setCart([]);
      setTender('');
      // Play cash drawer sound
      playCashDrawerSound();
      // refresh items to show updated stock on inventory page too if needed
      fetch('/api/items').then((r) => r.json()).then(setItems);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function clearCart() {
    setCart([]);
    setTender('');
    setMessage('');
  }

  // Quick tender buttons for common amounts
  const quickTenderAmounts = [5, 10, 20, 50, 100];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 60px)', gap: 0 }}>
      {/* Left Side - Categories and Items */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '2px solid #e5e7eb' }}>
        {/* Categories Navigation */}
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          borderBottom: '2px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          padding: '8px'
        }}>
          {grouped.map(({ category }) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '12px 20px',
                margin: '0 4px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: selectedCategory === category ? '#2563eb' : '#e5e7eb',
                color: selectedCategory === category ? 'white' : '#374151',
                fontWeight: selectedCategory === category ? '600' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div style={{ 
          padding: '20px', 
          overflow: 'auto', 
          flex: 1,
          backgroundColor: '#ffffff'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '12px' 
          }}>
            {currentCategoryItems.map((it) => {
              // Define background colors for different categories
              let backgroundColor = '#ffffff';
              let borderColor = '#e5e7eb';
              
              if (it.category === 'SNACKS') {
                const highlightedSnacks = ['Elote chico', 'Elote Grande', 'Elote Entero', 'Takis', 'Cheetos', 'Conchitas', 'Tostitos'];
                backgroundColor = highlightedSnacks.includes(it.name) ? '#f0fdf4' : '#ffffff';
                borderColor = highlightedSnacks.includes(it.name) ? '#22c55e' : '#e5e7eb';
              } else if (it.category === 'Chamoyadas') {
                backgroundColor = '#fefce8';
                borderColor = '#fbbf24';
              } else if (it.category === 'Drinks') {
                backgroundColor = '#eff6ff';
                borderColor = '#3b82f6';
              } else if (it.category === 'Frappes') {
                backgroundColor = '#fef3c7';
                borderColor = '#f59e0b';
              } else if (it.category === 'Bobas') {
                backgroundColor = '#fdf2f8';
                borderColor = '#ec4899';
              }
              
              return (
                <button 
                  key={it.id} 
                  onClick={() => addToCart(it)} 
                  style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    border: `2px solid ${borderColor}`, 
                    borderRadius: '12px', 
                    background: backgroundColor, 
                    cursor: 'pointer', 
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minHeight: '100px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '18px', lineHeight: '1.2' }}>{it.name}</div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#059669',
                    marginTop: 'auto'
                  }}>
                    {centsToUSD(it.priceCents)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Cart and Checkout */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            Current Order
          </h2>
          <button
            onClick={clearCart}
            style={{
              padding: '8px 16px',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Clear Cart
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          {cart.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              fontSize: '16px',
              padding: '40px 20px'
            }}>
              No items in cart
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((l) => (
                <div key={l.itemId} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr auto auto auto auto', 
                  gap: '12px', 
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontWeight: '500', fontSize: '16px' }}>{l.name}</div>
                  <div style={{ fontSize: '16px', color: '#059669', fontWeight: '600' }}>
                    {centsToUSD(l.priceCents)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => updateQty(l.itemId, -1)} 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}
                    >
                      -
                    </button>
                    <span style={{ 
                      margin: '0 8px', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {l.quantity}
                    </span>
                    <button 
                      onClick={() => updateQty(l.itemId, 1)} 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ 
                    textAlign: 'right', 
                    fontSize: '16px', 
                    fontWeight: '700',
                    color: '#059669'
                  }}>
                    {centsToUSD(l.priceCents * l.quantity)}
                  </div>
                  <button
                    onClick={() => removeFromCart(l.itemId)}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #dc2626',
                      borderRadius: '4px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', fontSize: '16px' }}>
            <div style={{ color: '#6b7280' }}>Subtotal</div>
            <div style={{ fontWeight: '600' }}>{centsToUSD(subtotalCents)}</div>
            <div style={{ color: '#6b7280' }}>Tax (8.25%)</div>
            <div style={{ fontWeight: '600' }}>{centsToUSD(taxCents)}</div>
            <div style={{ 
              fontWeight: '700', 
              fontSize: '20px', 
              color: '#1f2937',
              borderTop: '2px solid #e5e7eb',
              paddingTop: '12px',
              marginTop: '8px'
            }}>
              Total
            </div>
            <div style={{ 
              fontWeight: '700', 
              fontSize: '20px', 
              color: '#059669',
              borderTop: '2px solid #e5e7eb',
              paddingTop: '12px',
              marginTop: '8px'
            }}>
              {centsToUSD(totalCents)}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Payment Method</h3>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px 16px',
              border: `2px solid ${paymentMethod === 'cash' ? '#2563eb' : '#e5e7eb'}`,
              borderRadius: '8px',
              backgroundColor: paymentMethod === 'cash' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              flex: 1,
              justifyContent: 'center',
              fontWeight: '500'
            }}>
              <input 
                type="radio" 
                name="pm" 
                value="cash" 
                checked={paymentMethod === 'cash'} 
                onChange={() => setPaymentMethod('cash')}
                style={{ margin: 0 }}
              />
              💵 Cash
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px 16px',
              border: `2px solid ${paymentMethod === 'credit' ? '#2563eb' : '#e5e7eb'}`,
              borderRadius: '8px',
              backgroundColor: paymentMethod === 'credit' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              flex: 1,
              justifyContent: 'center',
              fontWeight: '500'
            }}>
              <input 
                type="radio" 
                name="pm" 
                value="credit" 
                checked={paymentMethod === 'credit'} 
                onChange={() => setPaymentMethod('credit')}
                style={{ margin: 0 }}
              />
              💳 Credit
            </label>
          </div>

          {paymentMethod === 'cash' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Amount Tendered:
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={tender} 
                  onChange={(e) => setTender(e.target.value)} 
                  placeholder="0.00" 
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: '600'
                  }} 
                />
              </div>
              
              {/* Quick Tender Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {quickTenderAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTender(amount.toString())}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {tenderCents > 0 && (
                <div style={{ 
                  padding: '12px',
                  backgroundColor: changeCents >= 0 ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '8px',
                  border: `1px solid ${changeCents >= 0 ? '#22c55e' : '#dc2626'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: changeCents >= 0 ? '#059669' : '#dc2626'
                  }}>
                    Change: {centsToUSD(changeCents)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Complete Order Button */}
        <button 
          disabled={cart.length === 0 || submitting || (paymentMethod === 'cash' && tenderCents < totalCents)} 
          onClick={completeOrder} 
          style={{ 
            width: '100%', 
            padding: '20px', 
            background: cart.length === 0 || submitting || (paymentMethod === 'cash' && tenderCents < totalCents) 
              ? '#9ca3af' 
              : '#059669', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '20px', 
            fontWeight: '700',
            cursor: cart.length === 0 || submitting || (paymentMethod === 'cash' && tenderCents < totalCents) 
              ? 'not-allowed' 
              : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {submitting ? 'Processing...' : 'Complete Order'}
        </button>

        {/* Message */}
        {message && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px',
            backgroundColor: message.includes('complete') ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.includes('complete') ? '#22c55e' : '#dc2626'}`,
            borderRadius: '8px',
            color: message.includes('complete') ? '#059669' : '#dc2626',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}



