export const ROLES = {
  ADMIN: "Administrator",
  RESEARCHER: "Wildlife Researcher",
  CONSERVATION: "Conservation Officer",
  FOREST: "Forest Department Officer",
};

export const rolePermissions = {
  [ROLES.ADMIN]: {
    allowedPaths: ["/dashboard", "/profile", "/admin-users", "/admin-settings", "/analytics", "/audit-logs", "/wildlife-dashboard", "/notifications"],
    allowedActions: [
      "CAN_MANAGE_USERS",
      "CAN_MANAGE_SETTINGS",
      "CAN_CREATE_SURVEY",
      "CAN_UPLOAD_EVIDENCE",
      "CAN_VIEW_THREATS",
      "CAN_VIEW_FIELD_OPERATIONS"
    ],
    sidebar: [
      { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { name: 'User Management', path: '/admin-users', icon: 'Users' },
      { name: 'Platform Analytics', path: '/analytics', icon: 'Activity' },
      { name: 'System Settings', path: '/admin-settings', icon: 'Settings' },
      { name: 'Profile', path: '/profile', icon: 'UserCircle' },
    ]
  },
  [ROLES.RESEARCHER]: {
    allowedPaths: ["/dashboard", "/profile", "/surveys", "/uploads"],
    allowedActions: [
      "CAN_CREATE_SURVEY",
      "CAN_UPLOAD_EVIDENCE",
    ],
    sidebar: [
      { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { name: 'My Surveys', path: '/surveys', icon: 'Map' },
      { name: 'Upload Evidence', path: '/uploads', icon: 'Camera' },
      { name: 'Profile', path: '/profile', icon: 'UserCircle' },
    ]
  },
  [ROLES.CONSERVATION]: {
    allowedPaths: ["/dashboard", "/profile", "/threats", "/biodiversity"],
    allowedActions: [
      "CAN_VIEW_THREATS"
    ],
    sidebar: [
      { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { name: 'Threat Monitoring', path: '/threats', icon: 'AlertCircle' },
      { name: 'Biodiversity', path: '/biodiversity', icon: 'Leaf' },
      { name: 'Profile', path: '/profile', icon: 'UserCircle' },
    ]
  },
  [ROLES.FOREST]: {
    allowedPaths: ["/dashboard", "/profile", "/field-ops", "/patrols"],
    allowedActions: [
      "CAN_VIEW_FIELD_OPERATIONS"
    ],
    sidebar: [
      { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { name: 'Field Operations', path: '/field-ops', icon: 'Trees' },
      { name: 'Patrol Planning', path: '/patrols', icon: 'MapPin' },
      { name: 'Profile', path: '/profile', icon: 'UserCircle' },
    ]
  }
};

const getRoleString = (role) => {
  if (!role) return null;
  return typeof role === 'string' ? role : (role.name || role.role_name || role);
};

export const hasPermission = (role, action) => {
  const roleStr = getRoleString(role);
  if (!roleStr || !rolePermissions[roleStr]) return false;
  return rolePermissions[roleStr].allowedActions.includes(action);
};

export const hasRouteAccess = (role, path) => {
  const milestone1Paths = ['/dashboard', '/profile', '/surveys', '/sites', '/devices', '/uploads', '/observations', '/predictions', '/audio-predictions', '/species-identification', '/biodiversity-analytics', '/wildlife-reports', '/reports', '/map', '/settings', '/population-intelligence', '/habitat-intelligence', '/conservation-recommendations', '/ecosystem-health', '/wildlife-dashboard', '/notifications', '/testing-validation'];
  if (milestone1Paths.some(p => path.startsWith(p))) {
    return true;
  }
  
  const roleStr = getRoleString(role);
  if (!roleStr || !rolePermissions[roleStr]) {
    // Basic fallback
    return path === '/';
  }
  return rolePermissions[roleStr].allowedPaths.some(p => path.startsWith(p)) || path === '/';
};
