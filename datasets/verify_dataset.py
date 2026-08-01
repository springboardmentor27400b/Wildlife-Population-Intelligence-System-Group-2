import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parent
conn = sqlite3.connect(root.parent / 'wildlife.db')
cur = conn.cursor()

species_count = cur.execute('SELECT COUNT(*) FROM species').fetchone()[0]
site_count = cur.execute('SELECT COUNT(*) FROM monitoring_sites').fetchone()[0]
print({"species_count": species_count, "site_count": site_count})
conn.close()
