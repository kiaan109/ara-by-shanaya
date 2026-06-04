'use client';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || '';
function resolveImg(img: string) {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('/')) return img;
  return `${BACKEND}/${img}`;
}

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore(s => s.addItem);

  const moveToCart = (item: any) => {
    addItem({ _id: item._id, name: item.name, price: item.price, image: item.image });
    removeItem(item._id);
    toast.success('Moved to bag');
  };

  return (
    <div className="min-h-screen px-5 md:px-10 py-10">
      <div className="mb-8">
        <h1 className="text-[11px] tracking-[0.35em] uppercase mb-1">Wishlist</h1>
        <p className="text-[11px] text-[#767676]">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#767676]">Your wishlist is empty</p>
          <Link href="/shop" className="bg-black text-white text-[11px] tracking-[0.2em] uppercase px-10 py-4 hover:opacity-75 transition-opacity">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
          {items.map(item => {
            const img = resolveImg(item.image);
            return (
              <div key={item._id} className="group relative">
                <Link href={`/shop/${item._id}`}>
                  <div className="relative overflow-hidden bg-[#f0f0f0]" style={{ aspectRatio: '3/4' }}>
                    {img ? (
                      <img src={img} alt={item.name} className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <div className="absolute inset-0 bg-[#f0f0f0]" />
                    )}

                    {/* Remove button */}
                    <button
                      onClick={e => { e.preventDefault(); removeItem(item._id); }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white w-7 h-7 flex items-center justify-center hover:bg-black hover:text-white transition-all"
                      aria-label="Remove from wishlist"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>

                    {/* Move to bag */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                      <button
                        onClick={e => { e.preventDefault(); moveToCart(item); }}
                        className="w-full bg-white text-black text-[10px] tracking-[0.18em] uppercase py-3 hover:bg-black hover:text-white transition-colors duration-150"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </Link>
                <div className="mt-2">
                  <p className="text-[12px] text-black leading-tight">{item.name}</p>
                  <p className="text-[12px] text-[#767676] mt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
