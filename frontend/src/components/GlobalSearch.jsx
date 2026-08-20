import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Camera, FileText, Activity, LayoutDashboard, Leaf, Sparkles, X, Clock, ArrowRight } from 'lucide-react';

const searchData = [
  { id: 'obs', title: 'Observation Records', type: 'Database', icon: FileText, path: '/observations' },
  { id: 'sites', title: 'Monitoring Sites', type: 'Location', icon: MapPin, path: '/sites' },
  { id: 'ai-det', title: 'AI Species Detection', type: 'AI Tool', icon: Camera, path: '/predictions' },
  { id: 'bio', title: 'Bioacoustic Analysis', type: 'AI Tool', icon: Activity, path: '/audio-predictions' },
  { id: 'pop', title: 'Population Intelligence', type: 'Analytics', icon: Activity, path: '/population-intelligence' },
  { id: 'hab', title: 'Habitat Intelligence', type: 'Analytics', icon: MapPin, path: '/habitat-intelligence' },
  { id: 'cons', title: 'Conservation Recommendation', type: 'AI Tool', icon: Leaf, path: '/conservation-recommendations' },
  { id: 'eco', title: 'Ecosystem Health', type: 'Analytics', icon: Sparkles, path: '/ecosystem-health' },
  { id: 'dash', title: 'Wildlife Dashboard', type: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'ana', title: 'Biodiversity Analytics', type: 'Analytics', icon: FileText, path: '/biodiversity-analytics' },
  { id: 'rep', title: 'Wildlife Reports', type: 'Document', icon: FileText, path: '/wildlife-reports' }
];

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('wpis_search_history');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredResults = query.trim() === '' 
    ? searchData.slice(0, 5) // Show top 5 as suggestions when empty
    : searchData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.type.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0) {
        handleSelect(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item) => {
    const updatedHistory = [item, ...recentSearches.filter(i => i.id !== item.id)].slice(0, 3);
    setRecentSearches(updatedHistory);
    localStorage.setItem('wpis_search_history', JSON.stringify(updatedHistory));
    
    navigate(item.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden relative z-[101] border border-border/50"
          >
            {/* Search Input */}
            <div className="relative flex items-center p-4 border-b border-border/50">
              <Search className="w-6 h-6 text-primary absolute left-6" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search WPIS..."
                className="w-full h-12 pl-12 pr-12 bg-transparent border-none text-lg focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
              />
              <button 
                onClick={onClose}
                className="absolute right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
              {query === '' && recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent
                  </div>
                  {recentSearches.map((item, idx) => (
                    <div
                      key={`recent-${item.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                        <span className="text-xs text-muted-foreground">{item.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                {query === '' ? 'Suggestions' : 'Results'}
              </div>
              
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                filteredResults.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === idx;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>{item.title}</h4>
                        <span className="text-xs text-muted-foreground">{item.type}</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition-all ${isSelected ? 'opacity-100 text-primary translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Footer commands */}
            <div className="p-3 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-background border border-border rounded font-sans text-[10px]">↑</kbd>
                  <kbd className="px-2 py-1 bg-background border border-border rounded font-sans text-[10px]">↓</kbd>
                  <span>to navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-background border border-border rounded font-sans text-[10px]">Enter</kbd>
                  <span>to select</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background border border-border rounded font-sans text-[10px]">ESC</kbd>
                <span>to close</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
