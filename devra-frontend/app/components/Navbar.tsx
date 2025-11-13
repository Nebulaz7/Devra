"use client";
import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  X,
  ArrowUpRight,
  Wallet,
  Feather,
  LaptopMinimal,
  House,
} from "lucide-react";
import "@fontsource/quantico/700.css";
import Link from "next/link";
import Image from "next/image";

const MotionLink = motion(Link);

const DoubleLineIcon = ({ size = 30, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
    className={className}
  >
    <rect x="4" y="9" width="24" height="2" rx="1" fill="currentColor" />
    <rect x="4" y="19" width="24" height="2" rx="1" fill="currentColor" />
  </svg>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="fixed top-0 left-0 right-0 flex bg-[171717]/70 lg:bg-transparent justify-center border-gray-500 m-0 font-sm p-2 bg-primary backdrop-blur-xl z-30 lg:rounded-full lg:mt-5 lg:mx-6 lg:py-2 lg:border-1 lg:shadow-md lg:shadow-pink-500/50"
    >
      <nav className="flex justify-between items-center gap-5 w-full max-w-7xl px-2 md:px-6 h-[3.5rem] mx-auto">
        <div className="flex gap-0">
          <Image
            src="/logo.svg"
            alt="Dallnk logo"
            content="fit-width"
            className="rounded-full p-0"
            height={60}
            width={60}
          />
          <h1
            style={{ fontFamily: "quantico, sans-serif" }}
            className="font-xl text-white inline-block mt-3"
          >
            Devra
          </h1>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden text-lg text-bold text-center md:flex gap-8 text-gray-200">
          <li>
            <MotionLink
              href="/home"
              className="hover:text-white transition-transform duration-200"
              whileHover={{ y: -4 }}
              layout
            >
              <House className="inline-block mr-3 mb-1" size={18} />
              Home
            </MotionLink>
          </li>
          <li>
            <MotionLink href="/signin" className="hover:text-white" layout>
              Explore
            </MotionLink>
          </li>
          <li>
            <MotionLink href="/signin" className="hover:text-white" layout>
              Community
            </MotionLink>
          </li>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <motion.button
            onClick={() => {
              window.location.href = "/signin";
            }}
            className="bg-pink-500 text-[16px] text-white px-4 cursor-pointer py-2 rounded-full flex items-center border-2 border-pink-500 gap-2 hover:bg-[#101010] hover:border-white transition duration-300"
            whileHover="hover"
            variants={{
              hover: { scale: 1.0 },
            }}
            layout
          >
            <Wallet className="inline mb-0" size={20} />
            Connect
            <motion.span
              className="text-lg font-extralight"
              variants={{
                hover: {
                  x: 4,
                  transition: { type: "spring", stiffness: 400, damping: 10 },
                },
              }}
            >
              <ArrowUpRight className="inline mb-1" />
            </motion.span>
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden lg:hidden text-white p-2 cursor-pointer"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMenuOpen ? (
              <X size={30} className="hidden" />
            ) : (
              <DoubleLineIcon />
            )}
          </motion.div>
        </button>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <motion.div
        initial={{ x: "-100%", y: "-100%" }}
        animate={{
          x: isMenuOpen ? 0 : "-100%",
          y: isMenuOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute py-2 top-0 left-0 w-full md:hidden min-h-[50vh] bg-transparent z-30 flex flex-col"
      >
        {/* Menu Header */}
        <div className="flex justify-between bg-transparent items-center p-3">
          <h1 className="font-md text-white text-xl"></h1>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white p-2 cursor-pointer"
          >
            <X size={30} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 bg-white pt-4  pb-0 rounded-2xl m-4 shadow-[2px_4px_0px_0px_#f6339a]">
          <ul className="flex flex-col gap-6 pl-6">
            <li className="gap-0">
              <Link
                href="/home"
                className="text-2xl text-black border-b-2 border-black hover:text-3xl  transition-colors"
              >
                Home
                <Feather className="inline-block ml-1" size={24} />
              </Link>
            </li>
            <li>
              <Link
                href="/home"
                className="text-2xl text-black border-b-2 border-black hover:text-3xl transition-colors"
              >
                Marketplace
                <ArrowUpRight className="inline-block ml-0.5" size={24} />
              </Link>
            </li>
            <li>
              <Link
                href="/signin"
                className="text-2xl text-black border-b-2 border-black hover:text-3xl  transition-colors"
              >
                Community
                <LaptopMinimal className="inline-block ml-0.5" size={24} />
              </Link>
            </li>
            <li></li>
          </ul>
          {/* Star button for mobile */}
          <div className="md:hidden ml-2 mb-2 lg:hidden flex items-center gap-6">
            <motion.button
              className="text-white px-4 cursor-pointer py-2 rounded-full flex items-center gap-2 hover:bg-pink-500 bg-[#101010] transition duration-300"
              whileHover="hover"
              variants={{
                hover: { scale: 1.0 },
              }}
              layout
            >
              <Wallet className="inline mb-0" size={20} />
              Connect
              <motion.span
                className="text-lg font-extralight"
                variants={{
                  hover: {
                    x: 4,
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  },
                }}
              >
                <ArrowUpRight className="inline mb-1" />
              </motion.span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Navbar;
