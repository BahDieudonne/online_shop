import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  UsersIcon, BoltIcon, SparklesIcon, ShieldCheckIcon,
  TruckIcon, CreditCardIcon, ArrowUturnLeftIcon,
  CheckBadgeIcon, StarIcon, MapPinIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const ICON_MAP = {
  users: UsersIcon,
  bolt: BoltIcon,
  sparkles: SparklesIcon,
  shield: ShieldCheckIcon,
  star: StarIcon,
  heart: UsersIcon,
  check: CheckBadgeIcon,
  map: MapPinIcon,
};

const DEFAULTS = {
  story: {
    heading: 'Our Story',
    body: "CHANCELOR STORE was born from a simple vision: make online shopping accessible, reliable, and enjoyable for everyone in Cameroon. Founded with passion, our store is committed to offering the best products at competitive prices.",
  },
  mission: {
    heading: 'Our Mission',
    body: 'Offer quality products at competitive prices, with fast delivery across Cameroon and exceptional customer service available 7 days a week.',
  },
  vision: {
    heading: 'Our Vision',
    body: 'Become the leading e-commerce platform in Central Africa, connecting Cameroonians with the best products in the world.',
  },
  stats: [
    { label: 'Happy Customers', value: '5,000+' },
    { label: 'Products Available', value: '1,000+' },
    { label: 'Cities Served', value: '10+' },
    { label: 'Years of Experience', value: '2+' },
  ],
  values: [
    { icon: 'users',    title: 'Trust',    desc: 'We build lasting relationships with our customers built on honesty and transparency.' },
    { icon: 'bolt',     title: 'Speed',    desc: 'Express delivery across Cameroon in the shortest possible time.' },
    { icon: 'sparkles', title: 'Quality',  desc: 'Only the best products, carefully selected for you.' },
    { icon: 'shield',   title: 'Security', desc: 'Secure payments, protected data, and guaranteed returns.' },
  ],
};

const WHY_US = [
  { Icon: TruckIcon,          title: 'Fast Delivery',    desc: 'Delivery across Cameroon in 2–5 business days.' },
  { Icon: CreditCardIcon,     title: 'Secure Payment',   desc: 'MTN MoMo, Orange Money, cash on delivery.' },
  { Icon: ArrowUturnLeftIcon, title: 'Easy Returns',     desc: 'Hassle-free returns and exchanges within 7 days.' },
];

const AboutPage = () => {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    api.get('/settings/page-about')
      .then(res => { if (res.data?.data) setContent(prev => ({ ...prev, ...res.data.data })); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Helmet><title>About Us CHANCELOR STORE</title></Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-800 via-navy-900 to-purple-900 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPinIcon className="w-4 h-4" /> Proudly Cameroonian
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
            About <span className="text-gold-400">CHANCELOR STORE</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Your trusted online store quality, speed, and satisfaction guaranteed.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gold-500 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {content.stats.map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-navy-900">{s.value}</div>
                <div className="text-sm text-navy-700 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">Who we are</span>
              <h2 className="font-display text-3xl font-bold text-navy-900 mt-2 mb-5">{content.story.heading}</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{content.story.body}</p>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-100 to-purple-100 h-72 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-28 h-28 text-indigo-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                </svg>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gold-400 rounded-2xl -z-10" />
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-navy-200 rounded-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { key: 'mission', Icon: CheckBadgeIcon, color: 'bg-indigo-50 text-indigo-600', border: 'hover:border-indigo-200' },
              { key: 'vision',  Icon: StarIcon,        color: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-200' },
            ].map(({ key, Icon, color, border }) => (
              <div key={key} className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 group ${border} transition-colors`}>
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{content[key]?.heading}</h3>
                <p className="text-gray-600 leading-relaxed">{content[key]?.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">What defines us</span>
            <h2 className="font-display text-3xl font-bold text-navy-900 mt-2">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.values.map((v, i) => {
              const Icon = ICON_MAP[v.icon] || SparklesIcon;
              return (
                <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors group cursor-default">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                    <Icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-navy-800 mb-2 text-lg">{v.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 bg-navy-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-navy-900">Why Choose Us?</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {WHY_US.map(({ Icon, title, desc }, i) => (
              <div key={i} className="flex gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-navy-800 mb-1">{title}</h4>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-navy-800 to-purple-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-white/70 mb-8 text-lg">Discover our collection and enjoy a unique shopping experience.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/shop" className="inline-block bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-8 py-3 rounded-xl transition-colors">
              Browse the Store
            </Link>
            <Link to="/contact" className="inline-block bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl transition-colors border border-white/20">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
