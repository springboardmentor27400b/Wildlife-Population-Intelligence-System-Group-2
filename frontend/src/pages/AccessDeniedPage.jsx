import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-card p-8 rounded-2xl shadow-xl border border-border text-center"
      >
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have the required permissions to view this page. Please contact an Administrator if you believe this is a mistake.
        </p>

        <Button 
          onClick={() => navigate('/dashboard')} 
          className="w-full rounded-xl h-12 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Button>
      </motion.div>
    </div>
  );
};

export default AccessDeniedPage;
