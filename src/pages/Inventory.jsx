import React, { useEffect, useMemo, useState } from 'react';

function centsToUSD(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch('/api/inventory').then((r) => r.json()).then(setItems);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category).push(it);
    }
    return Array.from(map.entries()).map(([category, list]) => ({ category, list }));
  }, [items]);

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Inventory</h3>
      {grouped.map(({ category, list }) => (
        <div key={category} style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '8px 0' }}>{category}</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 6 }}>Item</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 6 }}>Price</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 6 }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {list.map((it) => (
                <tr key={it.id}>
                  <td style={{ padding: 6 }}>{it.name}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{centsToUSD(it.priceCents)}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{it.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}



