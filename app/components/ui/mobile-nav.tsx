"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";

type NavLink = {
  label: string;
  href: string;
};

type MobileNavProps = {
  links: NavLink[];
  inverse?: boolean;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
};

export function MobileNav({
  links,
  inverse = false,
  ctaText = "Se connecter",
  ctaHref = "/connexion",
  className = "",
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [portalTarget] = useState(() =>
    typeof document !== "undefined" ? document.body : null,
  );

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className={"lg:hidden " + className}>
      {/* Trigger Button */}
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        className={`flex size-10 items-center justify-center rounded-xl border transition ${
          inverse
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-white text-[#17294b] shadow-sm hover:bg-slate-50"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Icon name={isOpen ? "close" : "menu"} size={22} />
      </button>

      {/* Mobile Menu Overlay & Drawer — portaled to <body> so backdrop-filter on the
          header can't trap the fixed positioning (containing block bug). */}
      {portalTarget
        ? createPortal(
            <AnimatePresence>
              {isOpen ? (
          <div className="fixed inset-0 z-[70] flex flex-col" data-lenis-prevent>
            {/* Backdrop Blur */}
            <motion.div
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              transition={{ duration: 0.2 }}
            />

            {/* Slide-down Card */}
            <motion.div
              animate={{ y: 0, opacity: 1, scale: 1 }}
              className="relative z-10 mx-4 mt-3 flex max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#101c32]/95 p-6 text-white shadow-2xl backdrop-blur-xl"
              exit={{ y: -20, opacity: 0, scale: 0.96 }}
              initial={{ y: -20, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <BrandMark inverse />
                <button
                  aria-label="Fermer le menu"
                  className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="my-6 space-y-2 overflow-y-auto" data-lenis-prevent>
                {links.map((link) => (
                  <Link
                    className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3.5 text-base font-semibold text-slate-100 transition hover:bg-white/10 hover:text-white"
                    href={link.href}
                    key={link.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{link.label}</span>
                    <Icon className="text-amber-400" name="arrow-right" size={18} />
                  </Link>
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className="mt-auto space-y-3 pt-2">
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e3a641] py-3.5 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/20 transition hover:bg-[#efb653]"
                  href="#rencontre"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon name="sparkles" size={18} />
                  Parlons de votre projet
                </Link>
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                  href={ctaHref}
                  onClick={() => setIsOpen(false)}
                >
                  {ctaText}
                </Link>
              </div>
              </motion.div>
            </div>
          ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
