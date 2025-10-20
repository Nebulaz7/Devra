"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import "@fontsource/quantico/700.css";
import { Settings, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TopNavProps {
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const TopNav = ({ className = "" }: TopNavProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      name: "My Datasets",
      href: "/datasets",
    },
    {
      name: "Marketplace",
      href: "/marketplace",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`pb-2 border-b-1 border-gray-500 sticky top-0 w-full shrink-0 bg-primary/50 backdrop-blur-xl z-30 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              style={{ fontFamily: "quantico, sans-serif" }}
              className="text-[24px] pl-2 gap-2"
            >
              Devra{" "}
              <span className="text-sm p-[6px] border-solid border-1 border-white rounded-full">
                Beta
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200
                      ${
                        active
                          ? "bg-gradient-to-r from-pink-500/20 to-pink-500/20 text-pink-400"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}

                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {/* User Profile - Desktop */}
              <div className="hidden md:flex items-center gap-4">
                <div className="mb-4 ">
                  <Settings className="w-5 h-5 text-white hover:text-white cursor-pointer" />
                </div>
                <div className="gap-3 px-3 py-2 transition-colors rounded-xl bg-white/5 hover:bg-white/10 ">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <Image
                      src="/avatars/cherry.svg"
                      alt="User Avatar"
                      width={28}
                      height={28}
                    />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-white text-sm font-medium">
                      0xABCD...1234
                    </p>
                    <p className="text-gray-500 text-xs">Connected</p>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sliding Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f17] border-r border-white/10 z-50 md:hidden overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <span
                      className="text-white font-bold text-lg"
                      style={{ fontFamily: "quantico, sans-serif" }}
                    >
                      D
                    </span>
                  </div>
                  <span
                    className="text-white font-bold text-xl"
                    style={{ fontFamily: "quantico, sans-serif" }}
                  >
                    Devra
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${
                          active
                            ? "bg-gradient-to-r from-pink-500/20 to-pink-500/20 text-pink-400"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          layoutId="activeMobileTab"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-400 to-pink-500 rounded-r-full"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0f0f17]">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/avatars/cherry.svg"
                      alt="User Avatar"
                      width={35}
                      height={35}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      0xABCD...1234
                    </p>
                    <p className="text-gray-500 text-xs truncate">Connected</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNav;
