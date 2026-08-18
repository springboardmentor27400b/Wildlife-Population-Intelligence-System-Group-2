import React from 'react';
import { useAuth } from '../context/AuthContext';
import ResearcherDashboard from '../components/dashboards/ResearcherDashboard';
import OfficerDashboard from '../components/dashboards/OfficerDashboard';
import ForestDeptDashboard from '../components/dashboards/ForestDeptDashboard';
import AdminDashboardLayout from '../components/dashboards/AdminDashboardLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'Researcher';

  switch (role) {
    case 'Admin':
      return <AdminDashboardLayout />;
    case 'Officer':
      return <OfficerDashboard />;
    case 'ForestDept':
      return <ForestDeptDashboard />;
    case 'Researcher':
    default:
      return <ResearcherDashboard />;
  }
}
