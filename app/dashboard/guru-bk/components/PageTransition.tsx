"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface Props { children: React.ReactNode; }

const variants = {
  hidden: { opacity: 0, y: 10 },
  enter:  { opacity: 1, y: 0  },
  exit:   { opacity: 0, y: -6 },
};

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex-1 flex flex-col min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
