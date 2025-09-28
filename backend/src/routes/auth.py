from flask import Blueprint, request, jsonify, session, redirect, url_for
from flask_cors import cross_origin
import requests
import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from src.models.wiki import db, User

auth_bp = Blueprint('auth', __name__)

# Discord OAuth設定
DISCORD_CLIENT_ID = os.getenv('DISCORD_CLIENT_ID', 'your_discord_client_id')
DISCORD_CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET', 'your_discord_client_secret')
DISCORD_REDIRECT_URI = os.getenv('DISCORD_REDIRECT_URI', 'http://localhost:5000/api/auth/callback')
JWT_SECRET = os.getenv('JWT_SECRET', 'your_jwt_secret_key')

# 管理者のDiscord IDリスト（環境変数から取得）
ADMIN_DISCORD_IDS = os.getenv('ADMIN_DISCORD_IDS', '').split(',')
EDITOR_DISCORD_IDS = os.getenv('EDITOR_DISCORD_IDS', '').split(',')

@auth_bp.route('/discord', methods=['GET'])
@cross_origin()
def discord_login():
    """Discord OAuth認証を開始"""
    discord_auth_url = (
        f"https://discord.com/api/oauth2/authorize?"
        f"client_id={DISCORD_CLIENT_ID}&"
        f"redirect_uri={DISCORD_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=identify"
    )
    return jsonify({'auth_url': discord_auth_url})

@auth_bp.route('/callback', methods=['GET'])
@cross_origin()
def discord_callback():
    """Discord OAuth コールバック処理"""
    code = request.args.get('code')
    if not code:
        return jsonify({'error': 'Authorization code not provided'}), 400
    
    try:
        # アクセストークンを取得
        token_data = {
            'client_id': DISCORD_CLIENT_ID,
            'client_secret': DISCORD_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': DISCORD_REDIRECT_URI
        }
        
        token_response = requests.post(
            'https://discord.com/api/oauth2/token',
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if token_response.status_code != 200:
            return jsonify({'error': 'Failed to get access token'}), 400
        
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        
        # ユーザー情報を取得
        user_response = requests.get(
            'https://discord.com/api/users/@me',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if user_response.status_code != 200:
            return jsonify({'error': 'Failed to get user info'}), 400
        
        user_data = user_response.json()
        discord_id = user_data['id']
        username = user_data['username']
        avatar_url = f"https://cdn.discordapp.com/avatars/{discord_id}/{user_data['avatar']}.png" if user_data.get('avatar') else None
        
        # ユーザーの役割を決定
        role = 'viewer'  # デフォルト
        if discord_id in ADMIN_DISCORD_IDS:
            role = 'admin'
        elif discord_id in EDITOR_DISCORD_IDS:
            role = 'editor'
        
        # ユーザーをデータベースに保存または更新
        user = User.query.filter_by(discord_id=discord_id).first()
        if user:
            user.username = username
            user.avatar_url = avatar_url
            user.role = role
            user.last_login = datetime.utcnow()
            user.ip_address = request.remote_addr
            user.user_agent = request.headers.get('User-Agent', '')
        else:
            user = User(
                discord_id=discord_id,
                username=username,
                avatar_url=avatar_url,
                role=role,
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')
            )
            db.session.add(user)
        
        db.session.commit()
        
        # JWTトークンを生成
        payload = {
            'user_id': user.id,
            'discord_id': discord_id,
            'role': role,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
        
        # フロントエンドにリダイレクト（トークンをクエリパラメータで渡す）
        return redirect(f'/?token={token}')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@cross_origin()
def get_current_user():
    """現在のユーザー情報を取得"""
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'No token provided'}), 401
    
    try:
        # "Bearer "を除去
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload['user_id']
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict())
        
    except JWTError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@cross_origin()
def logout():
    """ログアウト"""
    # JWTトークンベースなので、クライアント側でトークンを削除するだけ
    return jsonify({'message': 'Logged out successfully'})

def require_auth(f):
    """認証が必要なエンドポイント用のデコレータ"""
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.current_user = User.query.get(payload['user_id'])
            
            if not request.current_user:
                return jsonify({'error': 'User not found'}), 404
            
            return f(*args, **kwargs)
            
        except JWTError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    decorated_function.__name__ = f.__name__
    return decorated_function

def require_role(required_role):
    """特定の役割が必要なエンドポイント用のデコレータ"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            role_hierarchy = {'viewer': 0, 'editor': 1, 'admin': 2}
            user_role_level = role_hierarchy.get(request.current_user.role, 0)
            required_role_level = role_hierarchy.get(required_role, 0)
            
            if user_role_level < required_role_level:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

