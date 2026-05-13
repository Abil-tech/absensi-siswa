"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

const variants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Cek apakah layar mobile (< 768px = breakpoint md Tailwind)
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mobile: langsung tampil tanpa animasi apapun
  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    );
  }

  // Desktop: animasi fade + slide
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{
          duration: 0.22,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="flex-1 flex flex-col min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
