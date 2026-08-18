import React, { useState, useEffect, useRef } from 'react';
import { surveysAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Plus, Search, Eye, Pause, Play, Edit, Trash2, Calendar, Globe, ChevronDown, Check } from 'lucide-react';

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Surveys() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalStartDate, setModalStartDate] = useState('');
  const [modalEndDate, setModalEndDate] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalStatus, setModalStatus] = useState('Active');
  const [modalCountry, setModalCountry] = useState('Tanzania');
  const [editingId, setEditingId] = useState(null);
  
  // Country Dropdown Filter State
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);
  const listContainerRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState('');

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await surveysAPI.list();
      setSurveys(data);
    } catch (err) {
      console.error("Error loading surveys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setModalTitle('');
    setModalStartDate(new Date().toISOString().split('T')[0]);
    setModalEndDate('');
    setModalDesc('');
    setModalStatus('Active');
    setModalCountry('Tanzania');
    setCountrySearch('');
    setIsCountryDropdownOpen(false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (survey) => {
    setEditingId(survey.id);
    setModalTitle(survey.title);
    setModalStartDate(survey.start_date);
    setModalEndDate(survey.end_date || '');
    setModalDesc(survey.description || '');
    setModalStatus(survey.status);
    setModalCountry(survey.country || 'Tanzania');
    setCountrySearch('');
    setIsCountryDropdownOpen(false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      title: modalTitle,
      start_date: modalStartDate,
      end_date: modalEndDate || null,
      description: modalDesc || null,
      country: modalCountry || 'Tanzania',
      status: modalStatus
    };

    try {
      if (editingId) {
        await surveysAPI.update(editingId, payload);
      } else {
        await surveysAPI.create(payload);
      }
      window.dispatchEvent(new Event('dashboard-stats-update'));
      setIsModalOpen(false);
      fetchSurveys();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to save survey. Verify details.');
    }
  };

  const handleToggleStatus = async (survey) => {
    const nextStatus = survey.status === 'Active' ? 'Paused' : 'Active';
    try {
      await surveysAPI.update(survey.id, { status: nextStatus });
      window.dispatchEvent(new Event('dashboard-stats-update'));
      fetchSurveys();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;
    try {
      await surveysAPI.delete(id);
      window.dispatchEvent(new Event('dashboard-stats-update'));
      fetchSurveys();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Delete operation failed.");
    }
  };

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (s.country && s.country.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter countries for dropdown
  const filteredCountries = ALL_COUNTRIES.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const canModify = user?.role === 'Admin' || user?.role === 'Researcher';

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Survey Management</h2>
          <p className="text-sm text-zinc-400 mt-1">Deploy, schedule, and review global wildlife monitoring projects.</p>
        </div>
        {canModify && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-900/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>New Survey</span>
          </button>
        )}
      </div>

      {/* Filter and search controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 text-zinc-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search surveys by title, country, or description..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none text-sm transition"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-300 outline-none text-sm transition cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Content Stream */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          Loading survey registries...
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl text-zinc-500">
          <ClipboardList className="mx-auto text-zinc-600 mb-3" size={32} />
          <p className="font-bold text-zinc-400">No surveys found</p>
          <p className="text-xs text-zinc-650 mt-1">Try refining search parameters or create a new survey.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSurveys.map((survey) => (
            <div key={survey.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-base leading-snug">{survey.title}</h3>
                    <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-400 font-semibold">
                      <Globe size={13} className="shrink-0" />
                      <span>{survey.country || 'Tanzania'}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    survey.status === 'Active' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' 
                      : survey.status === 'Paused'
                        ? 'bg-yellow-950 text-yellow-400 border border-yellow-900/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {survey.status}
                  </span>
                </div>
                
                <p className="text-xs text-zinc-400 line-clamp-3 mb-5 leading-relaxed">{survey.description || 'No description provided.'}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-4">
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>Start: {survey.start_date}</span>
                  </div>
                  {survey.end_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>End: {survey.end_date}</span>
                    </div>
                  )}
                </div>

                {canModify && (
                  <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800/40">
                    <button
                      onClick={() => handleToggleStatus(survey)}
                      title={survey.status === 'Active' ? 'Pause Survey' : 'Activate Survey'}
                      className="p-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
                    >
                      {survey.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(survey)}
                      title="Edit Survey"
                      className="p-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    {user?.role === 'Admin' && (
                      <button
                        onClick={() => handleDelete(survey.id)}
                        title="Delete Survey"
                        className="p-2 bg-zinc-950 border border-red-950 hover:bg-red-950/40 text-red-500 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Survey Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-zinc-100">{editingId ? 'Edit Survey' : 'Create New Survey'}</h3>
            
            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-900/30 text-red-400 text-xs rounded-lg font-medium text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Survey Title</label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Serengeti census, wetlands census, etc."
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-100 outline-none text-sm transition"
                />
              </div>

              {/* SEARCHABLE COUNTRY DROPDOWN */}
              <div className="space-y-1.5 relative" ref={countryDropdownRef}>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Country Location</span>
                  <span className="text-[10px] text-emerald-400 lowercase">keyword search enabled</span>
                </label>
                
                <div
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus-within:border-emerald-500 rounded-xl text-zinc-100 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center space-x-2">
                    <Globe size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-200">{modalCountry || 'Select a Country...'}</span>
                  </div>
                  <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu Overlay */}
                {isCountryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-zinc-750 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-64">
                    {/* Filter Input */}
                    <div className="p-2 border-b border-zinc-800 bg-zinc-950 sticky top-0">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
                        <input
                          type="text"
                          autoFocus
                          value={countrySearch}
                          onChange={(e) => {
                            setCountrySearch(e.target.value);
                            if (listContainerRef.current) {
                              listContainerRef.current.scrollTop = 0;
                            }
                          }}
                          placeholder="Type country name (e.g. J for Jamaica, Japan)..."
                          className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Scrollable Country List */}
                    <div ref={listContainerRef} className="overflow-y-auto max-h-48 divide-y divide-zinc-800/40">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <div
                            key={c}
                            onClick={() => {
                              setModalCountry(c);
                              setIsCountryDropdownOpen(false);
                            }}
                            className={`px-4 py-2 text-xs flex items-center justify-between cursor-pointer transition ${
                              modalCountry === c ? 'bg-emerald-950/60 text-emerald-400 font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            <span>{c}</span>
                            {modalCountry === c && <Check size={14} className="text-emerald-400" />}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-zinc-500 text-center">No countries matching "{countrySearch}"</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={modalStartDate}
                    onChange={(e) => setModalStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">End Date (Optional)</label>
                  <input
                    type="date"
                    value={modalEndDate}
                    onChange={(e) => setModalEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  placeholder="Provide scope, targets, and notes for this survey census..."
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-100 outline-none text-sm transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-950/20 cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Create Survey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
