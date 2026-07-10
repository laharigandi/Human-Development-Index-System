import sqlite3
conn = sqlite3.connect('hdi_predictions.db')
cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Tables:', [row[0] for row in cursor.fetchall()])
conn.close()