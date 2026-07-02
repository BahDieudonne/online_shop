import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ChevronDownIcon, MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon, QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const CATEGORIES = ['All', 'Orders & Delivery', 'Payments', 'Returns & Refunds', 'Account', 'Products'];

const AccordionItem = ({ faq, isOpen, onToggle }) => (
  <div className={`border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-indigo-200 shadow-sm' : 'border-gray-200'}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
    >
      <span className={`font-medium text-sm leading-snug ${isOpen ? 'text-indigo-700' : 'text-gray-800'}`}>
        {faq.question}
      </span>
      <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 bg-white">
        {faq.answer}
      </div>
    )}
  </div>
);

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.get('/content/faqs')
      .then(res => setFaqs(res.data?.data || []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return faqs.filter(f => {
      const matchCat = activeCategory === 'All' || f.category === activeCategory;
      const matchSearch = !search.trim() ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [faqs, search, activeCategory]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(f => {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    });
    return map;
  }, [filtered]);

  const categories = useMemo(() => {
    const used = [...new Set(faqs.map(f => f.category))];
    return ['All', ...used];
  }, [faqs]);

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <>
      <Helmet><title>FAQ CHANCELOR STORE</title></Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-800 via-navy-900 to-purple-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <QuestionMarkCircleIcon className="w-4 h-4" /> Help Center
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-gold-400">Questions</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Find quick answers to the most common questions about orders, payments, returns, and more.
          </p>
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveCategory('All'); }}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 shadow-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 bg-gray-50 min-h-[50vh]">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Category tabs */}
          {!search && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'text-indigo-200' : 'text-gray-400'}`}>
                      ({faqs.filter(f => f.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 h-14 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <QuestionMarkCircleIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-500">No results found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term or browse all categories.</p>
              <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-4 btn-outline text-sm px-4 py-2">
                Clear filters
              </button>
            </div>
          ) : search ? (
            /* Flat list when searching */
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>
              {filtered.map(faq => (
                <AccordionItem key={faq._id} faq={faq} isOpen={openId === faq._id} onToggle={() => toggle(faq._id)} />
              ))}
            </div>
          ) : (
            /* Grouped by category */
            <div className="space-y-10">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <h2 className="text-base font-bold text-navy-800 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
                    {cat}
                    <span className="text-xs font-normal text-gray-400 ml-1">({items.length})</span>
                  </h2>
                  <div className="space-y-2">
                    {items.map(faq => (
                      <AccordionItem key={faq._id} faq={faq} isOpen={openId === faq._id} onToggle={() => toggle(faq._id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Still have questions?</h2>
          <p className="text-gray-500 mb-6">Our team is available 6 days a week and replies in under an hour on WhatsApp.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://wa.me/237674962803"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Chat on WhatsApp
            </a>
            <Link to="/contact" className="inline-block btn-outline px-6 py-3 font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQPage;
