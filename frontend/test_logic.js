const apiResults = [
  { status: 'Passed' }, { status: 'Passed' }, { status: 'Passed' }, { status: 'Passed' },
  { status: 'Passed' }, { status: 'Passed' }, { status: 'Passed' }, { status: 'Passed' }
];

const dataIntegrityResults = [
  { check: 'Missing Species Name', checked: 0, issues: 0, status: 0 === 0 ? 'Passed' : 'Warning' },
  { check: 'Missing Coordinates', checked: 0, issues: 0, status: 0 === 0 ? 'Passed' : 'Warning' },
  { check: 'Unverified Records', checked: 0, issues: 0, status: 0 === 0 ? 'Passed' : 'Warning' }
];

const aiMetrics = { status: 'Available' };

const allChecks = [...apiResults, ...dataIntegrityResults];
const total = allChecks.length + (aiMetrics ? 1 : 1);
const passed = allChecks.filter(c => c.status === 'Passed').length + (aiMetrics?.status === 'Available' ? 1 : 0);
const failed = allChecks.filter(c => c.status === 'Failed').length + (aiMetrics?.status === 'Error' ? 1 : 0);

console.log('Total:', total);
console.log('Passed:', passed);
console.log('Failed:', failed);
