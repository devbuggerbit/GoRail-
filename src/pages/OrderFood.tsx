import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, UtensilsCrossed, Check, Leaf, Drumstick } from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface FoodItem {
  id: string; name: string; description: string; price: number;
  category: string; image_url: string | null; is_veg: boolean; is_available: boolean;
}

const CATEGORIES = ['all', 'main', 'snack', 'beverage', 'dessert'];

export default function OrderFood() {
  const { user } = useAuth();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [category, setCategory] = useState('all');
  const [coach, setCoach] = useState('');
  const [berth, setBerth] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    supabase.from('food_items').select('*').eq('is_available', true).then(({ data }) => {
      if (data) setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = category === 'all' ? items : items.filter(i => i.category === category);
  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);
  const totalItems = cartItems.reduce((s, [, q]) => s + q, 0);
  const totalAmount = cartItems.reduce((s, [id, q]) => s + (items.find(i => i.id === id)?.price || 0) * q, 0);

  const add = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remove = (id: string) => setCart(c => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));

  const placeOrder = async () => {
    if (!user || !coach || !berth) return;
    setPlacing(true);
    const { data: order } = await supabase.from('food_orders').insert({
      user_id: user.id,
      coach_number: coach,
      berth_number: berth,
      total_amount: totalAmount,
      payment_method: payMethod,
      status: 'placed',
    }).select().maybeSingle();

    if (order) {
      await supabase.from('food_order_items').insert(
        cartItems.map(([id, qty]) => ({
          order_id: order.id,
          food_item_id: id,
          quantity: qty,
          unit_price: items.find(i => i.id === id)?.price || 0,
        }))
      );
      setOrdered(true);
    }
    setPlacing(false);
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-[#060e1e]">
        <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
        <Header title="Order Food" showBack backTo="dashboard" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-white/50 mb-2">Your food will be delivered to</p>
          <p className="text-[#FF9933] font-bold">Coach {coach}, Berth {berth}</p>
          <p className="text-white/40 text-sm mt-4 mb-6">Estimated delivery: 20-30 minutes</p>
          <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Order Amount</span>
              <span className="text-[#FF9933] font-bold">₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>
          <button onClick={() => { setOrdered(false); setCart({}); setShowCheckout(false); }}
            className="w-full bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-3 rounded-xl">
            Order More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="Order Food" showBack backTo="dashboard" />

      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm capitalize transition-all ${
                category === cat ? 'bg-[#FF9933] text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/40">Loading menu...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
                  {item.image_url && (
                    <div className="h-36 overflow-hidden">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {item.is_veg
                            ? <Leaf className="w-3 h-3 text-green-400 flex-shrink-0" />
                            : <Drumstick className="w-3 h-3 text-red-400 flex-shrink-0" />
                          }
                          <span className="text-white text-sm font-medium">{item.name}</span>
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed">{item.description}</p>
                      </div>
                      <span className="text-[#FF9933] font-bold text-sm">₹{item.price}</span>
                    </div>
                    <div className="flex items-center justify-end mt-3">
                      {qty === 0 ? (
                        <button onClick={() => add(item.id)}
                          className="bg-[#FF9933] text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#ff8c1a] transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#FF9933]/20 border border-[#FF9933]/30 rounded-lg px-2 py-1">
                          <button onClick={() => remove(item.id)} className="text-[#FF9933] hover:text-white transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[#FF9933] font-bold text-sm w-4 text-center">{qty}</span>
                          <button onClick={() => add(item.id)} className="text-[#FF9933] hover:text-white transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart bar */}
      {totalItems > 0 && !showCheckout && (
        <div className="fixed bottom-4 left-4 right-4 max-w-3xl mx-auto z-40">
          <button onClick={() => setShowCheckout(true)}
            className="w-full bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-bold py-4 rounded-2xl flex items-center justify-between px-5 shadow-2xl">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{totalItems} items</span>
            </div>
            <span>View Cart • ₹{totalAmount.toFixed(0)}</span>
          </button>
        </div>
      )}

      {/* Checkout drawer */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full max-w-3xl mx-auto bg-[#0f2347] border-t border-white/15 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-[#FF9933]" /> Your Order</h3>

            <div className="space-y-2 mb-5">
              {cartItems.map(([id, qty]) => {
                const item = items.find(i => i.id === id);
                return item ? (
                  <div key={id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#FF9933]/20 rounded-lg flex items-center justify-center text-[#FF9933] text-xs font-bold">{qty}</div>
                      <span className="text-white text-sm">{item.name}</span>
                    </div>
                    <span className="text-white/60 text-sm">₹{(item.price * qty).toFixed(0)}</span>
                  </div>
                ) : null;
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-white/60 text-xs mb-1.5">Coach Number *</label>
                <input value={coach} onChange={e => setCoach(e.target.value)} placeholder="e.g. S3"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]" />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1.5">Berth Number *</label>
                <input value={berth} onChange={e => setBerth(e.target.value)} placeholder="e.g. 42"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]" />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {['UPI', 'Card', 'Cash on Delivery'].map(m => (
                <button key={m} onClick={() => setPayMethod(m)}
                  className={`flex-1 py-2 rounded-lg text-xs transition-all border ${payMethod === m ? 'bg-[#FF9933]/10 border-[#FF9933] text-[#FF9933]' : 'bg-white/5 border-white/10 text-white/50'}`}>
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 mb-4">
              <span className="text-white/60 text-sm">Total Amount</span>
              <span className="text-[#FF9933] font-bold text-lg">₹{totalAmount.toFixed(0)}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCheckout(false)} className="flex-1 border border-white/20 text-white py-3 rounded-xl hover:bg-white/5">Cancel</button>
              <button onClick={placeOrder} disabled={placing || !coach || !berth}
                className="flex-2 bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50">
                {placing ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
