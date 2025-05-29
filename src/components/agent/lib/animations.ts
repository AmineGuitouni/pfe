// Animation variants for Framer Motion
import { Variants } from 'framer-motion';

export const containerVariants: Variants = {
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    scale: 1,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      duration: 0.2
    }
  },
  hovered: {
    width: 320,
    height: 110,
    borderRadius: 20,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      duration: 0.2
    }
  },
  expanded: {
    width: 380,
    height: 500,
    borderRadius: 20,
    scale: 1,
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      duration: 0.2
    }
  }
};

export const headerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      duration: 0.5
    }
  }
};

export const messageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: index * 0.1
    }
  }),
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  }
};

export const inputVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25
    }
  },
  focus: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  }
};

export const sendButtonVariants: Variants = {
  idle: {
    rotate: 0,
    scale: 1
  },
  hover: {
    rotate: 15,
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15
    }
  },
  tap: {
    rotate: 45,
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 600,
      damping: 20
    }
  }
};

export const dotVariants: Variants = {
  hidden: {
    y: 0,
    opacity: 0.3
  },
  visible: (index: number) => ({
    y: [-5, 0],
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      delay: index * 0.2,
      ease: 'easeInOut'
    }
  })
};

export const iconVariants: Variants = {
  idle: {
    scale: 1,
    rotate: 0
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15
    }
  }
};
