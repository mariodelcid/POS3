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
      'Tostitos',
      'Sopa'
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
  const taxCents = 0; // adjust if needed
  const totalCents = subtotalCents + taxCents;
  const tenderCents = Math.round(parseFloat(tender || '0') * 100);
  const changeCents = paymentMethod === 'cash' ? Math.max(0, tenderCents - totalCents) : 0;

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
      // refresh items to show updated stock on inventory page too if needed
      fetch('/api/items').then((r) => r.json()).then(setItems);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', height: 'calc(100vh - 60px)' }}>
      <div style={{ padding: 16, overflow: 'auto', borderRight: '1px solid #eee' }}>
        {grouped.map(({ category, list }) => (
          <div key={category} style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '8px 0', fontSize: '1.25em' }}>{category}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {list.map((it) => (
                <button key={it.id} onClick={() => addToCart(it)} style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '1.25em' }}>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  <div style={{ opacity: 0.7 }}>{centsToUSD(it.priceCents)}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: '1.25em' }}>Cart</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '1.25em' }}>
          {cart.length === 0 && <div style={{ opacity: 0.7 }}>No items</div>}
          {cart.map((l) => (
            <div key={l.itemId} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center' }}>
              <div>{l.name}</div>
              <div>{centsToUSD(l.priceCents)}</div>
              <div>
                <button onClick={() => updateQty(l.itemId, -1)} style={{ fontSize: '1.25em' }}>-</button>
                <span style={{ margin: '0 8px' }}>{l.quantity}</span>
                <button onClick={() => updateQty(l.itemId, 1)} style={{ fontSize: '1.25em' }}>+</button>
              </div>
              <div style={{ textAlign: 'right' }}>{centsToUSD(l.priceCents * l.quantity)}</div>
            </div>
          ))}
        </div>
        <hr />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, fontSize: '1.25em' }}>
          <div>Subtotal</div>
          <div>{centsToUSD(subtotalCents)}</div>
          <div>Tax</div>
          <div>{centsToUSD(taxCents)}</div>
          <div style={{ fontWeight: 700 }}>Total</div>
          <div style={{ fontWeight: 700 }}>{centsToUSD(totalCents)}</div>
        </div>
        <div style={{ marginTop: 12, fontSize: '1.25em' }}>
          <label>
            <input type="radio" name="pm" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Cash
          </label>
          <label style={{ marginLeft: 16 }}>
            <input type="radio" name="pm" value="credit" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} /> Credit
          </label>
        </div>
        {paymentMethod === 'cash' && (
          <div style={{ marginTop: 8, fontSize: '1.25em' }}>
            <label> Tendered: <input type="number" step="0.01" value={tender} onChange={(e) => setTender(e.target.value)} placeholder="0.00" style={{ fontSize: '1.25em' }} /> </label>
            <div>Change: <strong>{centsToUSD(changeCents)}</strong></div>
          </div>
        )}
        <button disabled={cart.length === 0 || submitting || (paymentMethod === 'cash' && tenderCents < totalCents)} onClick={completeOrder} style={{ marginTop: 12, width: '100%', padding: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1.25em', cursor: 'pointer' }}>
          {submitting ? 'Submitting…' : 'Complete Order'}
        </button>
        {message && <div style={{ marginTop: 8, fontSize: '1.25em' }}>{message}</div>}
      </div>
    </div>
  );
}



