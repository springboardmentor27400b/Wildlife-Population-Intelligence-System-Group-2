import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { motion } from 'framer-motion';

const PlaceholderPage = ({ title, description, Icon }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[70vh]"
    >
      <div className="mb-6 h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center relative shadow-inner">
        {Icon && <Icon className="h-12 w-12 text-primary opacity-80" />}
        <div className="absolute -bottom-2 -right-2">
          <span className="flex h-6 w-6 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-primary/20 items-center justify-center border border-primary/30 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
            </span>
          </span>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
      <p className="text-muted-foreground max-w-md text-lg mb-8 leading-relaxed">
        {description}
      </p>
      
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/10 border border-secondary/20 shadow-sm">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-40"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
        </span>
        <span className="text-sm font-semibold text-secondary">Coming in the next module</span>
      </div>
    </motion.div>
  );
};

export default PlaceholderPage;
