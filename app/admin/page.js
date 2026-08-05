



'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Upload,
  Plus,
  Tag,
  Loader2,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  Lock,
  KeyRound,
} from 'lucide-react';
import Link from 'next/link';

// SETTING KATA SANDI ADMIN DI SINI
const ADMIN_PASSWORD = 'admin123'; // Silakan ganti dengan kata sandi pilihan Anda

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Cek sesi login saat halaman dimuat
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      fetchProducts();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setPasswordError('');
      fetchProducts();
    } else {
      setPasswordError('Kata sandi salah! Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  const parseTags = (tagsData) => {
    if (!tagsData) return [];
    if (Array.isArray(tagsData)) return tagsData;
    if (typeof tagsData === 'string') {
      return tagsData.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return [];
  };

  const fetchProducts = async () => {
    try {
      setFetchingProducts(true);
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Silakan pilih foto produk terlebih dahulu!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const safeExtension = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
      const filePath = `img_${Date.now()}.${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('produk_image')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('produk_image')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from('produk').insert([
        {
          name,
          price: parseFloat(price),
          description,
          tags: tags,
          image_url: imageUrl,
        },
      ]);

      if (insertError) throw new Error(`Database error: ${insertError.message}`);

      setMessage('Produk berhasil ditambahkan!');

      setName('');
      setPrice('');
      setDescription('');
      setTags([]);
      setImageFile(null);
      setImagePreview(null);

      fetchProducts();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal menambahkan produk: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        const { error } = await supabase.from('produk').delete().eq('id', id);
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        alert('Gagal menghapus produk: ' + error.message);
      }
    }
  };

  // TAMPILAN JIKA BELUM TERAUTENTIKASI (MODAL LOGIN)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-lg border space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Akses Admin</h1>
            <p className="text-xs text-gray-500">
              Masukkan kata sandi untuk mengelola produk katalog UMKM.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition"
            >
              Masuk Dashboard
            </button>
          </form>

          <div className="text-center border-t pt-4">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-blue-600 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Katalog Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN JIKA SUDAH TERAUTENTIKASI (DASHBOARD ADMIN)
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Publik
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
              Admin Panel
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:underline font-medium"
            >
              Keluar (Logout)
            </button>
          </div>
        </div>

        {/* Form Tambah Produk */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
            Tambah Produk Baru
          </h1>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Produk <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-36 h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition relative overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">Pilih Foto</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Format yang didukung: JPG, PNG, WEBP.</p>
                  <p>Disarankan ukuran foto di bawah 2MB.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Keripik Pisang Lumer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="15000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag / Kategori Produk
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Ketik tag lalu klik Tambah"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-500 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Produk
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tulis deskripsi singkat..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-300 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Simpan Produk'
              )}
            </button>
          </form>
        </div>

        {/* Tabel Daftar Produk */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Daftar Produk Terdaftar ({products.length})
          </h2>

          {fetchingProducts ? (
            <div className="py-8 text-center text-gray-500 flex justify-center items-center gap-2 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              Memuat data...
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              Belum ada produk yang tersimpan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="py-3 px-4">Foto</th>
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-4">Harga</th>
                    <th className="py-3 px-4">Tag</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => {
                    const productTags = parseTags(p.tags);

                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          Rp {p.price?.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {productTags.map((t, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
