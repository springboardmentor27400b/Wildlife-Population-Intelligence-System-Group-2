import csv
import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parent
conn = sqlite3.connect(root.parent / 'wildlife.db')
cur = conn.cursor()

with open(root / 'species.csv', newline='', encoding='utf-8') as handle:
    reader = csv.DictReader(handle)
    for row in reader:
        cur.execute(
            'INSERT OR IGNORE INTO species (common_name, scientific_name, category, iucn_status) VALUES (?, ?, ?, ?)',
            (row['common_name'], row['scientific_name'], row['category'], row['iucn_status']),
        )

conn.commit()
conn.close()
print('Loaded species data')
