import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Compass, Shield, HelpCircle, FileText } from 'lucide-react';
import { getSpeciesDetail } from '../api/species';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';

export const SpeciesDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [species, setSpecies] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getSpeciesDetail(id);
        setSpecies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!species) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">Species profile not found.</p>
        <Link to="/species">
          <Button variant="outline">Back to Library</Button>
        </Link>
      </div>
    );
  }

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
      <div className="flex items-center gap-2">
        <Link to="/species">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Species Library</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-3xl font-bold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-7 h-7 text-emerald-600" />
                  {species.common_name}
                </h2>
                <p className="italic text-slate-450 mt-1">
                  {species.scientific_name.replace('_', ' ')}
                </p>
              </div>
              <div>
                <Badge variant={getStatusColor(species.conservation_status)}>
                  {species.conservation_status}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-slate-650 dark:text-slate-400">
              This species is tracked as part of the 54 core classes in the closed-set YOLO model. Click on the resources side links to explore additional field studies.
            </p>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                Biological Taxonomy
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg text-xs">
                <div>
                  <div className="text-slate-450">Kingdom</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{species.taxonomy.kingdom}</div>
                </div>
                <div>
                  <div className="text-slate-450">Class</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{species.taxonomy.class}</div>
                </div>
                <div>
                  <div className="text-slate-450">Family</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{species.taxonomy.family}</div>
                </div>
                <div>
                  <div className="text-slate-450">Genus</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{species.taxonomy.genus}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                Conservation Status & Ecology
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div><strong>Habitat:</strong> {species.habitat}</div>
                  <div><strong>Primary Diet:</strong> {species.diet}</div>
                  <div><strong>Lifespan:</strong> {species.lifespan}</div>
                </div>
                <div className="space-y-1.5">
                  <div><strong>Trend:</strong> {species.population_trend}</div>
                  <div><strong>Population Estimate:</strong> {species.population_estimate}</div>
                  <div><strong>Threat Level:</strong> {species.threat_level}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Interesting Facts */}
          {species.interesting_facts && species.interesting_facts.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                Key Facts
              </h3>
              <ul className="space-y-2 text-sm text-slate-650 dark:text-slate-400">
                {species.interesting_facts.map((fact, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Resources Panel */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-emerald-600" />
              External Links
            </h3>
            <div className="space-y-3">
              {species.wikipedia_link && (
                <a
                  href={species.wikipedia_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-semibold"
                >
                  Wikipedia Entry
                </a>
              )}
              {species.iucn_link && (
                <a
                  href={species.iucn_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-semibold"
                >
                  IUCN Red List Profile
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeciesDetail;
