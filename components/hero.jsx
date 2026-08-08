"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="pt-40 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[100px] pb-6 bg-linear-to-br from-blue-900 to-purple-900 font-extrabold tracking-tighter pr-2 text-transparent bg-clip-text">
          Audit Finances of NSS
          <br /> with Intelligence
        </h1>
        <p className="text-3xl pt-2 text-gray-700 mb-4 max-w-2xl mx-auto font-semibold uppercase">
          {"\""} NOT ME BUT YOU {"\""}
        </p>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Our vision is to build the youth with the mind and spirit to serve the society and work for the social uplift of the down-trodden masses of our nation as a movement.
        </p>

        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 bg-blue-950 text-white hover:bg-blue-900">
              Get Started
            </Button>
          </Link>
          <Link href="https://github.com/AtharvOps">
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner-a.png"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;