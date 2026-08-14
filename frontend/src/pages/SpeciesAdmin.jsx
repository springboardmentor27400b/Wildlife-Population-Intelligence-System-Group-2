import React, { useState, useEffect } from 'react';
import { getSpeciesList, createSpecies, updateSpecies, deleteSpecies } from '../api/species';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { Edit2, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SpeciesAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [speciesList, setSpeciesList] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  
  // Modals & Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    common_name: '',
    scientific_name: '',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class_name: 'Mammalia',
    order_name: '',
    family: '',
    genus: '',
    habitat: '',
    diet: '',
    lifespan: '',
    conservation_status: 'Least Concern',
    population_trend: 'Stable',
    population_estimate: '',
    threat_level: 'Low',
    native_regions: '',
    fact_1: '',
    fact_2: '',
    wikipedia_link: '',
    iucn_link: ''
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getSpeciesList({ page_size: 100 });
      setSpeciesList(data.items);
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to retrieve species list.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreateModal = () => {
    setSelectedSpecies(null);
    setFormData({
      common_name: '',
      scientific_name: '',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class_name: 'Mammalia',
      order_name: '',
      family: '',
      genus: '',
      habitat: '',
      diet: '',
      lifespan: '',
      conservation_status: 'Least Concern',
      population_trend: 'Stable',
      population_estimate: '',
      threat_level: 'Low',
      native_regions: '',
      fact_1: '',
      fact_2: '',
      wikipedia_link: '',
      iucn_link: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (species) => {
    setSelectedSpecies(species);
    setFormData({
      common_name: species.common_name,
      scientific_name: species.scientific_name,
      kingdom: species.taxonomy.kingdom || 'Animalia',
      phylum: species.taxonomy.phylum || 'Chordata',
      class_name: species.taxonomy.class || 'Mammalia',
      order_name: species.taxonomy.order || '',
      family: species.taxonomy.family || '',
      genus: species.taxonomy.genus || '',
      habitat: species.habitat,
      diet: species.diet,
      lifespan: species.lifespan,
      conservation_status: species.conservation_status,
      population_trend: species.population_trend,
      population_estimate: species.population_estimate,
      threat_level: species.threat_level,
      native_regions: species.native_regions,
      fact_1: species.interesting_facts[0] || '',
      fact_2: species.interesting_facts[1] || '',
      wikipedia_link: species.wikipedia_link || '',
      iucn_link: species.iucn_link || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteDialog = (species) => {
    setSelectedSpecies(species);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Construct payload
    const payload = {
      common_name: formData.common_name,
      scientific_name: formData.scientific_name,
      taxonomy: {
        kingdom: formData.kingdom,
        phylum: formData.phylum,
        class: formData.class_name,
        order: formData.order_name,
        family: formData.family,
        genus: formData.genus,
        species: formData.scientific_name.replace('_', ' ')
      },
      habitat: formData.habitat,
      diet: formData.diet,
      lifespan: formData.lifespan,
      conservation_status: formData.conservation_status,
      population_trend: formData.population_trend,
      population_estimate: formData.population_estimate,
      threat_level: formData.threat_level,
      native_regions: formData.native_regions,
      interesting_facts: [formData.fact_1, formData.fact_2].filter(Boolean),
      wikipedia_link: formData.wikipedia_link || null,
      iucn_link: formData.iucn_link || null
    };

    try {
      if (selectedSpecies) {
        await updateSpecies(selectedSpecies.id, payload);
        setToastMsg({ text: 'Species updated successfully!', type: 'success' });
      } else {
        await createSpecies(payload);
        setToastMsg({ text: 'Species registered successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchList();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to submit form.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSpecies(selectedSpecies.id);
      setToastMsg({ text: 'Species record deleted successfully.', type: 'success' });
      setIsDeleteOpen(false);
      fetchList();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to delete species.', type: 'error' });
    }
  };

  // Define table headers and cells
  const columns = [
    { header: 'Common Name', accessor: 'common_name' },
    { header: 'Scientific Name', accessor: (row) => row.scientific_name.replace('_', ' ') },
    { header: 'Family', accessor: (row) => row.taxonomy.family },
    { header: 'Status', accessor: 'conservation_status' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => openEditModal(row)} className="p-1">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => openDeleteDialog(row)} className="p-1 text-red-600 border-red-100 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg.text} type={toastMsg.type} onClose={() => setToastMsg(null)} />}

      <div className="flex items-center gap-2">
        <Link to="/species">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Species Library</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100">
            Species Metadata Control Panel
          </h1>
          <p className="text-xs text-slate-500">
            Admin tool to create, edit, or remove biological taxonomy profiles.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Add New Species
        </Button>
      </div>

      <Card className="p-4">
        <DataTable columns={columns} data={speciesList} loading={loading} />
      </Card>

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSpecies ? 'Update Species Profile' : 'Register New Species'}>
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Common Name</label>
              <input type="text" name="common_name" value={formData.common_name} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Scientific Name (e.g. Panthera_leo)</label>
              <input type="text" name="scientific_name" value={formData.scientific_name} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Family</label>
              <input type="text" name="family" value={formData.family} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Genus</label>
              <input type="text" name="genus" value={formData.genus} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Order</label>
              <input type="text" name="order_name" value={formData.order_name} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Habitat Details</label>
              <input type="text" name="habitat" value={formData.habitat} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Primary Diet</label>
              <input type="text" name="diet" value={formData.diet} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Average Lifespan</label>
              <input type="text" name="lifespan" value={formData.lifespan} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Conservation Status</label>
              <select name="conservation_status" value={formData.conservation_status} onChange={handleFormChange} className="w-full text-sm border rounded p-2 focus:outline-none">
                <option value="Critically Endangered">Critically Endangered</option>
                <option value="Endangered">Endangered</option>
                <option value="Vulnerable">Vulnerable</option>
                <option value="Near Threatened">Near Threatened</option>
                <option value="Least Concern">Least Concern</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Population Trend</label>
              <select name="population_trend" value={formData.population_trend} onChange={handleFormChange} className="w-full text-sm border rounded p-2 focus:outline-none">
                <option value="Increasing">Increasing</option>
                <option value="Decreasing">Decreasing</option>
                <option value="Stable">Stable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Population Estimate</label>
            <input type="text" name="population_estimate" value={formData.population_estimate} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Geographic Distribution / Native Regions</label>
            <input type="text" name="native_regions" value={formData.native_regions} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Key Fact 1</label>
              <input type="text" name="fact_1" value={formData.fact_1} onChange={handleFormChange} required className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Key Fact 2</label>
              <input type="text" name="fact_2" value={formData.fact_2} onChange={handleFormChange} className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Wikipedia URL (Optional)</label>
              <input type="url" name="wikipedia_link" value={formData.wikipedia_link} onChange={handleFormChange} className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">IUCN Link (Optional)</label>
              <input type="url" name="iucn_link" value={formData.iucn_link} onChange={handleFormChange} className="w-full text-sm border rounded p-2 focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {isDeleteOpen && (
        <ConfirmDialog
          title="Confirm Species Deletion"
          message={`Are you sure you want to delete the biological profile for ${selectedSpecies?.common_name}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}
    </div>
  );
};

export default SpeciesAdmin;
