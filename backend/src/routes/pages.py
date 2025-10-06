from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from datetime import datetime
from src.models.wiki import db, Page, PageHistory, User
from src.routes.auth import require_auth, require_role
import re

pages_bp = Blueprint('pages', __name__)

def create_slug(title):
    """タイトルからURLスラッグを生成"""
    # 日本語文字を含む場合の処理
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

@pages_bp.route('', methods=['GET'])
@cross_origin()
def get_pages():
    """ページ一覧を取得"""
    try:
        pages = Page.query.filter_by(is_published=True).order_by(Page.updated_at.desc()).all()
        return jsonify([page.to_dict() for page in pages])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pages_bp.route('/<slug>', methods=['GET'])
@cross_origin()
def get_page(slug):
    """特定のページを取得"""
    try:
        page = Page.query.filter_by(slug=slug, is_published=True).first()
        if not page:
            return jsonify({'error': 'Page not found'}), 404
        
        return jsonify(page.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pages_bp.route('', methods=['POST'])
@cross_origin()
@require_auth
@require_role('editor')
def create_page():
    """新しいページを作成"""
    try:
        data = request.get_json()
        if not data or not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        title = data['title']
        content = data.get('content', '')
        slug = data.get('slug') or create_slug(title)
        
        # スラッグの重複チェック
        existing_page = Page.query.filter_by(slug=slug).first()
        if existing_page:
            # 重複する場合は番号を追加
            counter = 1
            original_slug = slug
            while existing_page:
                slug = f"{original_slug}-{counter}"
                existing_page = Page.query.filter_by(slug=slug).first()
                counter += 1
        
        # 新しいページを作成
        page = Page(
            title=title,
            slug=slug,
            content=content,
            author_id=request.current_user.id
        )
        
        db.session.add(page)
        db.session.commit()
        
        # 履歴を保存
        history = PageHistory(
            page_id=page.id,
            content=content,
            author_id=request.current_user.id
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify(page.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pages_bp.route('/<int:page_id>', methods=['PUT'])
@cross_origin()
@require_auth
@require_role('editor')
def update_page(page_id):
    """ページを更新"""
    try:
        page = Page.query.get(page_id)
        if not page:
            return jsonify({'error': 'Page not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # 変更前のコンテンツを保存
        old_content = page.content
        
        # ページを更新
        if 'title' in data:
            page.title = data['title']
        if 'content' in data:
            page.content = data['content']
        if 'slug' in data and data['slug'] != page.slug:
            # スラッグの重複チェック
            existing_page = Page.query.filter_by(slug=data['slug']).first()
            if existing_page and existing_page.id != page.id:
                return jsonify({'error': 'Slug already exists'}), 400
            page.slug = data['slug']
        if 'is_published' in data:
            page.is_published = data['is_published']
        
        page.updated_at = datetime.utcnow()
        
        # 履歴を保存（コンテンツが変更された場合のみ）
        if 'content' in data and data['content'] != old_content:
            history = PageHistory(
                page_id=page.id,
                content=old_content,  # 変更前のコンテンツを保存
                author_id=request.current_user.id
            )
            db.session.add(history)
        
        db.session.commit()
        
        return jsonify(page.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pages_bp.route('/<int:page_id>', methods=['DELETE'])
@cross_origin()
@require_auth
@require_role('admin')
def delete_page(page_id):
    """ページを削除（管理者のみ）"""
    try:
        page = Page.query.get(page_id)
        if not page:
            return jsonify({'error': 'Page not found'}), 404
        
        db.session.delete(page)
        db.session.commit()
        
        return jsonify({'message': 'Page deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pages_bp.route('/<int:page_id>/history', methods=['GET'])
@cross_origin()
@require_auth
def get_page_history(page_id):
    """ページの変更履歴を取得"""
    try:
        page = Page.query.get(page_id)
        if not page:
            return jsonify({'error': 'Page not found'}), 404
        
        histories = PageHistory.query.filter_by(page_id=page_id).order_by(PageHistory.created_at.desc()).all()
        return jsonify([history.to_dict() for history in histories])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pages_bp.route('/search', methods=['GET'])
@cross_origin()
def search_pages():
    """ページを検索"""
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify([])
        
        # タイトルとコンテンツで検索
        pages = Page.query.filter(
            db.or_(
                Page.title.contains(query),
                Page.content.contains(query)
            ),
            Page.is_published == True
        ).order_by(Page.updated_at.desc()).limit(20).all()
        
        return jsonify([page.to_dict() for page in pages])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

