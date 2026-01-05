import { motion } from "framer-motion";

interface Props {
  active: boolean;
  children: React.ReactNode;
}

export function StackedCard({ active, children }: Props) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        y: active ? 0 : 40,
        scale: active ? 1 : 0.97,
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="absolute inset-0"
      style={{
        pointerEvents: active ? "auto" : "none",
        zIndex: active ? 2 : 1,
      }}
    >
      {children}
    </motion.div>
  );
}
