'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  ShoppingBag,
  Tag,
  Loader2,
  MessageCircle,
  Store,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

// Ganti dengan nomor WhatsApp UMKM Anda (Gunakan format 62)
const WHATSAPP_NUMBER = '6285399883387';

export default function PublicKatalog() {
  const [produk, setproduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('Semua');
  const [allTags, setAllTags] = useState(['Semua']);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-low', 'price-high'

  // Helper parsing tag (String / Array)
  const parseTags = (tagsData) => {
    if (!tagsData) return [];
    if (Array.isArray(tagsData)) return tagsData;
    if (typeof tagsData === 'string') {
      return tagsData.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    fetchproduk();
  }, []);

  const fetchproduk = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setproduk(data || []);

      // Ekstrak tag unik
      const tagsSet = new Set(['Semua']);
      data?.forEach((product) => {
        const productTags = parseTags(product.tags);
        productTags.forEach((t) => tagsSet.add(t));
      });
      setAllTags(Array.from(tagsSet));
    } catch (error) {
      console.error('Error fetching produk:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter berdasarkan Tag dan Kata Kunci Pencarian
  const filteredproduk = produk
    .filter((p) => {
      const productTags = parseTags(p.tags);
      const matchesTag =
        selectedTag === 'Semua' || productTags.includes(selectedTag);

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTag && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return new Date(b.created_at) - new Date(a.created_at); // 'newest'
    });

  // Fungsi Kirim Pesan ke WhatsApp
  const handleWhatsAppOrder = (product) => {
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(product.price);

    const message =
      `Halo Admin, saya berminat dengan produk ini:\n\n` +
      `*Produk:* ${product.name}\n` +
      `*Harga:* ${formattedPrice}\n\n` +
      `Apakah stok masih tersedia dan bisa kirim ke lokasi saya? Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header / Topbar */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Katalog UMKM
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">
                Produk Asli & Berkualitas
              </p>
            </div>
          </div>
          <a
            href="/admin"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-lg transition"
          >
            Akses Admin
          </a>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-4 mb-8 shadow-inner">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> Selamat Datang di Toko Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Temukan Produk Terbaik Favorit Anda
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl mx-auto">
            Pesan langsung tanpa ribet via WhatsApp. Proses mudah, cepat, dan terpercaya.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Search Bar & Sorting Option */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border shadow-sm">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk berdasarkan nama..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="newest">Terbaru</option>
              <option value="price-low">Harga: Termurah</option>
              <option value="price-high">Harga: Termahal</option>
            </select>
          </div>
        </div>

        {/* Filter Tag Chips */}
        <div className="overflow-x-auto pb-1 flex gap-2 no-scrollbar">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium">Memuat katalog produk...</p>
          </div>
        ) : filteredproduk.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-800 font-semibold mb-1">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada produk dengan kata kunci "${searchQuery}".`
                : `Belum ada produk untuk kategori "${selectedTag}".`}
            </p>
            {(searchQuery || selectedTag !== 'Semua') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('Semua');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        ) : (
          /* Grid Produk */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredproduk.map((product) => {
              const productTags = parseTags(product.tags);

              return (
                <div
                  key={product.id}
                  className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Container */}
                    <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                      <img
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-2">
                      {/* Tags */}
                      {productTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {productTags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-md flex items-center gap-1 border border-blue-100"
                            >
                              <Tag className="w-2.5 h-2.5" /> {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <h2 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h2>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {product.description || 'Tidak ada deskripsi.'}
                      </p>

                      <p className="text-base font-extrabold text-blue-600 pt-1">
                        Rp {product.price?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp Action Button */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleWhatsAppOrder(product)}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-green-100"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" /> Pesan via WA
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}