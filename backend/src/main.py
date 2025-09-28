import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.wiki import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.pages import pages_bp
from src.routes.menus import menus_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'zen-wiki-secret-key-change-in-production'

# CORS設定
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# ブループリントの登録
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(pages_bp, url_prefix='/api/pages')
app.register_blueprint(menus_bp, url_prefix='/api/menus')

# データベース設定
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# データベースの初期化
with app.app_context():
    db.create_all()
    
    # 初期データの作成
    from src.models.wiki import User, Page, Menu
    
    # デモ用の初期ページを作成
    if Page.query.count() == 0:
        # システム管理者ユーザーを作成（実際のDiscord IDに置き換える）
        admin_user = User(
            discord_id='system_admin',
            username='System Admin',
            role='admin'
        )
        db.session.add(admin_user)
        db.session.commit()
        
        # ホームページを作成
        home_page = Page(
            title='ホーム',
            slug='home',
            content='# Zenサーバー Wiki へようこそ\n\nこのWikiでは、Zenサーバーに関する情報を管理できます。\n\n## 機能\n- ページの作成・編集・削除\n- メニューの管理\n- Discord認証\n- 権限管理',
            author_id=admin_user.id
        )
        db.session.add(home_page)
        
        # サーバールールページを作成
        rules_page = Page(
            title='サーバールール',
            slug='rules',
            content='# サーバールール\n\n## 基本ルール\n1. 他のプレイヤーを尊重してください\n2. グリーフィングは禁止です\n3. チートやハックは使用しないでください\n\n## 建築ルール\n1. 他人の土地に無断で建築しないでください\n2. 公共エリアでの建築は事前に相談してください',
            author_id=admin_user.id
        )
        db.session.add(rules_page)
        
        db.session.commit()
        
        # メニューを作成
        home_menu = Menu(
            title='ホーム',
            page_id=home_page.id,
            order_index=0
        )
        db.session.add(home_menu)
        
        rules_menu = Menu(
            title='サーバールール',
            page_id=rules_page.id,
            order_index=1
        )
        db.session.add(rules_menu)
        
        db.session.commit()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'message': 'Zen Wiki API is running'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
