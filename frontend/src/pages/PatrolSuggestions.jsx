import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Compass, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

export const PatrolSuggestions = () => {
  const [sectors, setSectors] = useState([]);
  
  useEffect(() => {
    // Generate patrol suggestion corridors based on seeded data
    setSectors([
      { id: 1, name: 'Northern Tiger Corridor', risk: 'High', reason: 'Endangered Bengal Tiger sightings near agricultural border.', coords: 'Lat: 31.2, Lon: 77.4', priority: 'Immediate' },
      { id: 2, name: 'Southern Grassland Border', risk: 'Medium', reason: 'Herbivore migrations crossing outer perimeter.', coords: 'Lat: -8.3, Lon: 35.1', priority: 'Routine' },
      { id: 3, name: 'Elephant Waterhole Sector', risk: 'High', reason: 'Waterholes dry conditions leading to animal encounters.', coords: 'Lat: -1.2, Lon: 36.8', priority: 'Immediate' }
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-outfit">
          Ranger Patrol Coordinator
        </h1>
        <p className="text-sm text-slate-500">
          AI patrol suggestions and security logs for forest department officers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
            <Compass className="w-5 h-5 text-emerald-600" />
            Recommended Patrol Sectors
          </h3>

          <div className="space-y-4">
            {sectors.map(sec => (
              <div key={sec.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-250">{sec.name}</span>
                    <Badge variant={sec.risk === 'High' ? 'danger' : 'warning'}>{sec.risk} Risk</Badge>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">{sec.reason}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {sec.coords}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sec.priority === 'Immediate' ? 'danger' : 'secondary'}>{sec.priority}</Badge>
                  <Button variant="outline" size="sm">Acknowledge</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Checklist */}
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Patrol Checklist
          </h3>
          <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-400">
            <li className="flex gap-2">
              <input type="checkbox" className="mt-0.5" />
              <span>Verify camera trap batteries at Sector 1 coordinates.</span>
            </li>
            <li className="flex gap-2">
              <input type="checkbox" className="mt-0.5" />
              <span>Check river flow filters for plastic pollution.</span>
            </li>
            <li className="flex gap-2">
              <input type="checkbox" className="mt-0.5" />
              <span>Scan outer fence lines for breaches.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default PatrolSuggestions;
