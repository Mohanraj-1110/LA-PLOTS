import React from 'react';
import PropTypes from 'prop-types';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  ShieldCheck,
  Award,
  Zap,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sparkles,
  Layers,
  HeartHandshake,
} from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="About LA PLOTS"
        subtitle="The mobile-first real estate plot inventory & deal management system"
      />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Land Tech
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Manage • Grow • Close More Deals.
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
            LA PLOTS is engineered specifically for plotted land developers, layout promoters, and real estate agencies across India. It unifies plot inventory, surveyor dimensions, buyer pipeline stages, and automated profit calculations in a single responsive mobile workspace.
          </p>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Live Auto-Pricing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Instantly compute total acquisition amounts (Area × Rate/Sq.ft) and net profit margins across deals with zero human calculation error.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">RERA & Bank Compliant</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dedicated digital vault for 30-year clear title search deeds, layout sanctions, and customer KYC documentation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Mobile-First Velocity</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Built for agents on the move. Log site visits, WhatsApp brochures, and confirm token bookings from any mobile screen.
          </p>
        </div>
      </div>

      {/* Corporate & Contact Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Corporate Headquarters & Support</h3>
          <p className="text-xs text-slate-500 mt-0.5">LA Plots Realty LLP • RERA Registered Promoter</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Customer & Agent Desk</p>
              <p className="font-bold text-slate-900">+91 (080) 4122-9080 / +91 98451 99001</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Official Inquiry</p>
              <p className="font-bold text-slate-900">contact@laplots.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Head Office</p>
              <p className="font-bold text-slate-900">Prestige Meridian, MG Road, Bengaluru 560001</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <Globe className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Website</p>
              <p className="font-bold text-slate-900">https://laplots.com</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© 2026 LA PLOTS. All rights reserved.</p>
          <p className="font-semibold text-emerald-700">Version 2.4.0 Commercial SaaS Edition</p>
        </div>
      </div>
    </div>
  );
}

AboutPage.propTypes = {};
