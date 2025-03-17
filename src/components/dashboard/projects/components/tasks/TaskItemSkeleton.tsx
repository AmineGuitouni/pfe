import { motion } from 'framer-motion';
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function TaskItemSkeleton({index}:{index:number}) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.2, delay: 0.1 * index }}
      className="p-4 h-[122px] border-l-4 border-1 border-white/20 rounded-lg bg-white/5 animate-pulse"
    >
      <div className="flex items-center justify-between">
        <div className="w-3/4 h-6 bg-gray-700 rounded"></div>
        <div className="flex">
          <div className="w-4 h-4 rounded mr-1 bg-gray-700"></div>
          <div className="w-4 h-4 rounded bg-gray-700"></div>
        </div>
      </div>
      <div className="w-full h-4 bg-gray-700 rounded mt-2"></div>
      <div className="flex items-center mt-2">
        <div className="w-4 h-4 bg-gray-700 rounded mr-2"></div>
        <div className="w-1/4 h-4 bg-gray-700 rounded"></div>
        <div className="w-1/2 h-4 bg-gray-700 rounded ml-1"></div>
      </div>
    </motion.div>
  );
};