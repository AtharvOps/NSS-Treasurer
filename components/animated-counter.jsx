"use client";

import React, { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
  className = "",
}) {
  const numericTarget = typeof target === "number" ? target : parseFloat(target);
  const isTargetNumeric = !isNaN(numericTarget);
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView || !isTargetNumeric) return;

    let start = 0;
    const end = numericTarget;
    const totalSteps = Math.max(Math.floor(60 * duration), 1);
    const increment = end / totalSteps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      start += increment;
      if (step >= totalSteps || start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, isTargetNumeric, numericTarget, duration]);

  if (!isTargetNumeric) {
    return (
      <span ref={ref} className={className}>
        {prefix}
        {target}
        {suffix}
      </span>
    );
  }

  const formatted =
    decimals > 0
      ? count.toFixed(decimals)
      : Math.floor(count).toLocaleString("en-IN");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
