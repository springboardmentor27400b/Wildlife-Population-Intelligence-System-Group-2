import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

const DashboardHero = ({ user }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'User';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-8 md:p-10 text-white shadow-xl mb-8"
      style={{ fontFamily: 'Calibri, sans-serif' }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-green-400 opacity-20 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome back, {firstName}
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-black/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-200" />
            <span className="text-2xl font-semibold tracking-wider font-mono">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <span className="text-lg font-medium text-green-100">
            {format(currentTime, 'EEEE, MMM do')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHero;
