import csv
import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parent
conn = sqlite3.connect(root.parent / 'wildlife.db')
cur = conn.cursor()

with open(root / 'monitoring_sites.csv', newline='', encoding='utf-8') as handle:
    reader = csv.DictReader(handle)
    for row in reader:
        cur.execute(
            'INSERT OR IGNORE INTO monitoring_sites (site_name, latitude, longitude, habitat, country) VALUES (?, ?, ?, ?, ?)',
            (row['site_name'], float(row['latitude']), float(row['longitude']), row['habitat'], row['country']),
        )

conn.commit()
conn.close()
print('Loaded monitoring site data')
