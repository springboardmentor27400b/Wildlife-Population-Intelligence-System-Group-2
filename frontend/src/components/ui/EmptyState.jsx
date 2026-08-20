import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Trees } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = Trees, 
  title = "No Wildlife Data Found", 
  description = "We couldn't find any data matching your current filters in this intelligence module. Try adjusting your search criteria.",
  primaryAction,
  primaryActionText,
  secondaryAction,
  secondaryActionText
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[400px] w-full"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
        className="w-24 h-24 bg-gradient-to-br from-green-50 to-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-green-100/50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <Icon className="w-12 h-12 text-green-600 opacity-90 relative z-10" />
      </motion.div>
      
      <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed text-sm">
        {description}
      </p>
      
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <Button onClick={primaryAction} className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm">
              {primaryActionText || "Get Started"}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction} variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg">
              {secondaryActionText || "Learn More"}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
