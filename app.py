from flask import Flask, request, jsonify, send_from_directory
import sqlite3, os, datetime

app = Flask(__name__)
DB = os.path.join(os.path.dirname(__file__), 'results.db')

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            score INTEGER NOT NULL,
            persona TEXT NOT NULL,
            created_at TEXT NOT NULL
        )''')
        conn.commit()

init_db()

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/submit', methods=['POST'])
def submit():
    data = request.get_json()
    score = int(data.get('score', 0))
    persona = str(data.get('persona', ''))
    now = datetime.datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute('INSERT INTO results (score,persona,created_at) VALUES (?,?,?)', (score,persona,now))
        conn.commit()
    return jsonify({'status':'ok'})

@app.route('/api/stats')
def stats():
    score = request.args.get('score', 0, type=int)
    with get_db() as conn:
        total = conn.execute('SELECT COUNT(*) as c FROM results').fetchone()['c']
        lower = conn.execute('SELECT COUNT(*) as c FROM results WHERE score < ?', (score,)).fetchone()['c']
        pr = round(lower/total*100) if total > 0 else 85
        rows = conn.execute('SELECT persona, COUNT(*) as c FROM results GROUP BY persona').fetchall()
        personas = {r['persona']: r['c'] for r in rows}
    return jsonify({
        'total': total or 1,
        'pr': pr,
        'whale': personas.get('睿智的藍鯨', 0),
        'turtle': personas.get('堅韌的海龜', 0),
        'sealion': personas.get('迷航的海獅', 0),
        'crab': personas.get('被困住的寄居蟹', 0)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
