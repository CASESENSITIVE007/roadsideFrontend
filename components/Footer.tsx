// components/Footer.tsx
"use client"
import { AlertTriangle, Phone, Mail, Twitter, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#111418] border-t border-slate-200 dark:border-[#283039] py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Roadside Assist</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Fast, reliable, and safe roadside assistance when you need it most.
            </p>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a className="hover:text-primary transition-colors cursor-pointer" onClick={() => window.location.href='/dashboard/user'}>Towing</a></li>
              <li><a className="hover:text-primary transition-colors cursor-pointer" onClick={() => window.location.href='/dashboard/user'}>Flat Tire</a></li>
              <li><a className="hover:text-primary transition-colors cursor-pointer" onClick={() => window.location.href='/dashboard/user'}>Lockout</a></li>
              <li><a className="hover:text-primary transition-colors cursor-pointer" onClick={() => window.location.href='/dashboard/user'}>Fuel Delivery</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a className="hover:text-primary transition-colors" href="#about">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#careers">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="#privacy">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> 
                1-800-HELP-NOW
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> 
                support@roadside.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-[#283039] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            © {currentYear} Roadside Assist Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a className="text-slate-400 hover:text-primary transition-colors" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="https://github.com" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}