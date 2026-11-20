import sqlite3, sys
p = sys.argv[1]
b = open(p, 'rb').read()
print('tamanho', len(b), 'primeiros 16 bytes', b[:16].hex())
print('comeca com "SQLite format 3"?', b.startswith(b'SQLite format 3'))
print('contem MARCADOR-FICTICIO-ZEBRA-42?', b'MARCADOR-FICTICIO-ZEBRA-42' in b, '| contem "entrada_visitante"?', b'entrada_visitante' in b, '| contem "CREATE TABLE"?', b'CREATE TABLE' in b)
try:
    sqlite3.connect(p).execute('select name from sqlite_master').fetchall(); print('ABRIU (reprova)')
except Exception as e:
    print('sqlite3 padrao do Python', sqlite3.sqlite_version, '->', type(e).__name__, e)
