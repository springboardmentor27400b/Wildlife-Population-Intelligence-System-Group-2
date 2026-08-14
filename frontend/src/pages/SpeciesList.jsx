import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, ShieldAlert, Award } from 'lucide-react';
import { getSpeciesList } from '../api/species';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';

export const SpeciesList = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [speciesList, setSpeciesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12);

  const fetchSpecies = async () => {
    setLoading(true);
    try {
      const data = await getSpeciesList({
        search: searchTerm,
        status: statusFilter,
        page,
        page_size: pageSize
      });
      setSpeciesList(data.items);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecies();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSpecies();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critically Endangered': return 'danger';
      case 'Endangered': return 'danger';
      case 'Vulnerable': return 'warning';
      case 'Near Threatened': return 'warning';
      case 'Least Concern': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-outfit">
            Species Library
          </h1>
          <p className="text-sm text-slate-500">
            Browse and search taxonomic information on seeded wildlife species.
          </p>
        </div>
        {user?.role === 'Administrator' && (
          <Link to="/species/admin">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Manage Species (Admin)
            </Button>
          </Link>
        )}
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search common or scientific name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 dark:text-slate-200 focus:outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Critically Endangered">Critically Endangered</option>
              <option value="Endangered">Endangered</option>
              <option value="Vulnerable">Vulnerable</option>
              <option value="Near Threatened">Near Threatened</option>
              <option value="Least Concern">Least Concern</option>
            </select>
          </div>
          <Button type="submit" variant="primary" size="sm">Apply Search</Button>
        </form>
      </Card>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : speciesList.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-350">No species found</h3>
          <p className="text-xs text-slate-500">Refine your search parameters or query another term.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speciesList.map((species) => (
              <Card key={species.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 font-outfit">
                        {species.common_name}
                      </h3>
                      <p className="italic text-xs text-slate-450">
                        {species.scientific_name.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(species.conservation_status)}>
                      {species.conservation_status}
                    </Badge>
                  </div>
                  
                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    <div><strong>Taxonomy:</strong> {species.taxonomy.family}</div>
                    <div><strong>Habitat:</strong> {species.habitat}</div>
                    <div><strong>Diet:</strong> {species.diet}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex justify-end">
                  <Link to={`/species/${species.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpeciesList;
