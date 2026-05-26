from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3, os, datetime

app = Flask(__name__)
CORS(app) # 允許跨來源請求，支援前端部署在 GitHub Pages
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
        # 自動檢查並加入 nickname 欄位 (相容舊資料庫)
        cursor = conn.execute("PRAGMA table_info(results)")
        columns = [row['name'] for row in cursor.fetchall()]
        if 'nickname' not in columns:
            conn.execute("ALTER TABLE results ADD COLUMN nickname TEXT")
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
        cursor = conn.execute('INSERT INTO results (score,persona,created_at) VALUES (?,?,?)', (score,persona,now))
        conn.commit()
        inserted_id = cursor.lastrowid
    return jsonify({'status':'ok', 'id': inserted_id})

@app.route('/api/pledge', methods=['POST'])
def pledge():
    data = request.get_json()
    row_id = data.get('id')
    nickname = data.get('nickname', '匿名守護者')
    if row_id:
        with get_db() as conn:
            conn.execute('UPDATE results SET nickname = ? WHERE id = ?', (nickname, row_id))
            conn.commit()
    return jsonify({'status': 'ok'})

@app.route('/api/guardians')
def guardians():
    with get_db() as conn:
        rows = conn.execute(
            'SELECT nickname, score FROM results WHERE nickname IS NOT NULL AND nickname != "" ORDER BY id DESC LIMIT 50'
        ).fetchall()
        guardians_list = [{'name': r['nickname'], 'score': r['score']} for r in rows]
    return jsonify(guardians_list)

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
