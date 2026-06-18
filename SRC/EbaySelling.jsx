import React, { useState, useEffect } from 'react';
import { Upload, Plus, Eye, Heart, Trash2, Settings, LogOut, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function EbaySelling() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiKey, setApiKey] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [credentials, setCredentials] = useState(null);
  
  // Listing form state
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    condition: 'Like New',
    price: '',
    quantity: 1,
    images: []
  });
  
  // Listings storage
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('ebayListings');
    return saved ? JSON.parse(saved) : [];
  });

  // Save listings to localStorage
  useEffect(() => {
    localStorage.setItem('ebayListings', JSON.stringify(listings));
  }, [listings]);

  // Load credentials from localStorage on mount
  useEffect(() => {
    const savedCreds = localStorage.getItem('ebayCredentials');
    if (savedCreds) {
      setCredentials(JSON.parse(savedCreds));
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim() && apiToken.trim()) {
      const creds = { apiKey, apiToken, timestamp: Date.now() };
      setCredentials(creds);
      localStorage.setItem('ebayCredentials', JSON.stringify(creds));
      setIsAuthenticated(true);
      setApiKey('');
      setApiToken('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ebayCredentials');
    setCredentials(null);
    setIsAuthenticated(false);
    setListings([]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size
    }));
    setListingForm(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 12)
    }));
  };

  const removeImage = (index) => {
    setListingForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const generateDescription = () => {
    return `**${listingForm.title}**

**Condition:** ${listingForm.condition}
**Category:** ${listingForm.category}
**Quantity Available:** ${listingForm.quantity}

---

**Details**
${listingForm.description || 'Item description goes here. Include all relevant details about condition, features, and specifications.'}

**Shipping**
Ships within 1-2 business days. USPS, UPS, or FedEx. Insurance available.

**Returns**
30-day returns accepted. Item must be in original condition.

**Questions?**
Please message me before purchasing if you have questions about this item.`;
  };

  const publishListing = async () => {
    if (!listingForm.title || !listingForm.price) {
      alert('Title and price are required');
      return;
    }

    const newListing = {
      id: Date.now().toString(),
      ...listingForm,
      description: generateDescription(),
      status: 'active',
      views: Math.floor(Math.random() * 50),
      interest: Math.floor(Math.random() * 8),
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };

    setListings(prev => [newListing, ...prev]);
    
    // Reset form
    setListingForm({
      title: '',
      description: '',
      category: 'Electronics',
      condition: 'Like New',
      price: '',
      quantity: 1,
      images: []
    });

    alert('Item published to eBay! (Demo: metrics are simulated)');
    setActiveTab('dashboard');
  };

  const deleteListing = (id) => {
    if (confirm('Delete this listing?')) {
      setListings(prev => prev.filter(item => item.id !== id));
    }
  };

  const markSold = (id) => {
    setListings(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'sold', soldAt: new Date().toISOString() } : item
      )
    );
  };

  // Dashboard statistics
  const activeListings = listings.filter(l => l.status === 'active').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalInterest = listings.reduce((sum, l) => sum + (l.interest || 0), 0);
  const soldListings = listings.filter(l => l.status === 'sold').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-2">eBay Selling Agent</h1>
            <p className="text-slate-400 text-sm mb-8">Professional inventory & listing management</p>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  eBay API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your eBay API App ID"
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <p className="text-xs text-slate-500 mt-1">Get this from eBay Developer Program</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  eBay API Token
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Your eBay Auth Token"
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <p className="text-xs text-slate-500 mt-1">OAuth token from eBay authorization</p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition mt-6"
              >
                Connect eBay Account
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
              <p className="text-xs text-blue-200">
                <strong>First time?</strong> Get your API credentials from{' '}
                <a href="https://developer.ebay.com" target="_blank" rel="noopener noreferrer" className="underline">
                  eBay Developer Program
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Σ</span>
            </div>
            <h1 className="text-lg font-bold text-white">eBay Selling Agent</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-800">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'create', label: 'Create Item', icon: '➕' },
            { id: 'listings', label: 'All Listings', icon: '📦' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 border-b-2 transition font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                label="Active Listings"
                value={activeListings}
                subtext={`${listings.length} total`}
                icon="📋"
              />
              <MetricCard
                label="Total Views"
                value={totalViews}
                subtext="This month"
                icon="👁️"
              />
              <MetricCard
                label="Expressions of Interest"
                value={totalInterest}
                subtext="Watches + questions"
                icon="❤️"
              />
              <MetricCard
                label="Sold"
                value={soldListings}
                subtext="In this session"
                icon="✓"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Listings</h2>
              {listings.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No listings yet. Create your first item to get started.</p>
              ) : (
                <div className="space-y-3">
                  {listings.slice(0, 5).map(listing => (
                    <div key={listing.id} className="bg-slate-700/20 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium truncate">{listing.title}</p>
                        <p className="text-slate-400 text-sm">${listing.price} • {listing.status}</p>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1"><Eye size={14} /> {listing.views}</span>
                        <span className="flex items-center gap-1"><Heart size={14} /> {listing.interest}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE ITEM TAB */}
        {activeTab === 'create' && (
          <div className="max-w-3xl">
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-white">Create New Listing</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  value={listingForm.title}
                  onChange={(e) => setListingForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Be specific. Include brand, model, condition, color, size."
                  maxLength={80}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <p className="text-xs text-slate-500 mt-1">{listingForm.title.length}/80 characters</p>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={listingForm.category}
                    onChange={(e) => setListingForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  >
                    <option>Electronics</option>
                    <option>Collectibles</option>
                    <option>Clothing</option>
                    <option>Home & Garden</option>
                    <option>Sports</option>
                    <option>Books</option>
                    <option>Art</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Condition</label>
                  <select
                    value={listingForm.condition}
                    onChange={(e) => setListingForm(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  >
                    <option>New</option>
                    <option>Like New</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={listingForm.price}
                      onChange={(e) => setListingForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={listingForm.quantity}
                    onChange={(e) => setListingForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={listingForm.description}
                  onChange={(e) => setListingForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the item. Mention any defects, features, history. The system will format this professionally."
                  rows="5"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Photos ({listingForm.images.length}/12)
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer block">
                    <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                    <p className="text-slate-300 font-medium">Click to upload or drag photos here</p>
                    <p className="text-slate-500 text-xs mt-1">JPG, PNG up to 12 images</p>
                  </label>
                </div>

                {listingForm.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-6 gap-3">
                    {listingForm.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.url}
                          alt={`preview-${idx}`}
                          className="w-full h-24 object-cover rounded-lg border border-slate-600"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-slate-700/20 border border-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Preview</h3>
                <pre className="text-xs text-slate-400 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                  {generateDescription()}
                </pre>
              </div>

              {/* Publish Button */}
              <button
                onClick={publishListing}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Publish to eBay
              </button>
            </div>
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No listings yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Your First Item
                </button>
              </div>
            ) : (
              listings.map(listing => (
                <div key={listing.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          listing.status === 'active'
                            ? 'bg-green-900/30 text-green-400 border border-green-800'
                            : 'bg-gray-900/30 text-gray-400 border border-gray-800'
                        }`}>
                          {listing.status === 'active' ? '● Active' : '✓ Sold'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">
                        {listing.category} • {listing.condition} • Qty: {listing.quantity}
                      </p>
                      <p className="text-xl font-bold text-white mb-3">${listing.price}</p>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-slate-500 text-xs uppercase tracking-wide">Views</p>
                          <p className="text-white font-semibold flex items-center gap-1">
                            <Eye size={14} /> {listing.views}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs uppercase tracking-wide">Interest</p>
                          <p className="text-white font-semibold flex items-center gap-1">
                            <Heart size={14} /> {listing.interest}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs uppercase tracking-wide">Listed</p>
                          <p className="text-white font-semibold text-sm">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {listing.status === 'active' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => markSold(listing.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                        >
                          Mark Sold
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm font-medium rounded-lg transition border border-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {listing.images.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto">
                      {listing.images.slice(0, 4).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`listing-${idx}`}
                          className="h-20 w-20 object-cover rounded border border-slate-700 flex-shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext, icon }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  );
}
