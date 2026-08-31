import React from 'react';
import Logo from '../../shared/components/Logo';

export default function AuthLayout({ banner, children }) {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Column: Brand Showcase Banner (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/90 via-slate-950/80 to-slate-900/90 z-10" />
        <img
          src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200"
          alt="Gritmode Lifestyle"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        />

        <div className="relative z-20">
          <Logo to="/" />
        </div>

        <div className="relative z-20 max-w-md">
          <blockquote className="space-y-2">
            <p className="text-2xl font-black tracking-tight leading-snug">
              "Bền bỉ vượt qua mọi giới hạn. Phong cách định hình bản lĩnh."
            </p>
            <footer className="text-sm font-semibold text-brand-400">
              — GRITMODE APPAREL
            </footer>
          </blockquote>
        </div>

        <div className="relative z-20 text-xs text-slate-500">
          © {new Date().getFullYear()} GRITMODE. All rights reserved.
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo to="/" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
