import sqlite3

conn = sqlite3.connect('wildlife.db')
cur = conn.cursor()
cur.execute(
    '''
    SELECT o.id, s.common_name, m.site_name, o.observation_date, o.count
    FROM observations o
    JOIN species s ON o.species_id = s.id
    JOIN monitoring_sites m ON o.site_id = m.id
    ORDER BY o.id
    '''
)
rows = cur.fetchall()
print('rows_count:', len(rows))
for row in rows:
    print('id:', row[0], '| species:', row[1], '| site:', row[2], '| date:', row[3], '| count:', row[4])
conn.close()
