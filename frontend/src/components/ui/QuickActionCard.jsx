import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ title, icon: Icon, path, gradientClass }) => {
  return (
    <Link to={path} className="block w-full h-full">
      <motion.div 
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all h-full group cursor-pointer flex flex-col items-center justify-center text-center gap-3"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradientClass} text-white shadow-sm group-hover:shadow-md transition-shadow duration-300 transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <span className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">{title}</span>
      </motion.div>
    </Link>
  );
};

export default QuickActionCard;
