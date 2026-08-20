import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Brain, Cpu, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './card';

const SystemStatusWidget = ({ lastSync }) => {
  const [statuses, setStatuses] = useState({
    backend: 'Healthy',
    database: 'Healthy',
    aiEngine: 'Healthy',
    cache: 'Healthy'
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy': return 'text-green-500 bg-green-50';
      case 'Degraded': return 'text-orange-500 bg-orange-50';
      case 'Down': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIconColor = (status) => {
    switch (status) {
      case 'Healthy': return 'bg-green-500';
      case 'Degraded': return 'bg-orange-500';
      case 'Down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const systemComponents = [
    { name: 'Backend API', icon: Server, status: statuses.backend },
    { name: 'Database', icon: Database, status: statuses.database },
    { name: 'AI Engine', icon: Brain, status: statuses.aiEngine },
    { name: 'Cache Layer', icon: Cpu, status: statuses.cache },
  ];

  return (
    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl h-full">
      <CardHeader className="pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Server className="w-4 h-4 text-primary" /> System Status
          </CardTitle>
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {systemComponents.map((comp, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <comp.icon className="w-4 h-4 text-gray-400" />
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusIconColor(comp.status)}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusIconColor(comp.status)}`} />
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-600 truncate">{comp.name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last Sync</span>
          <span className="font-medium text-gray-600">{lastSync ? new Date(lastSync).toLocaleTimeString() : 'Just now'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusWidget;
