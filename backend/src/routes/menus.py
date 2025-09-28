from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from src.models.wiki import db, Menu, Page
from src.routes.auth import require_auth, require_role

menus_bp = Blueprint('menus', __name__)

@menus_bp.route('', methods=['GET'])
@cross_origin()
def get_menus():
    """メニュー構造を取得"""
    try:
        # ルートメニュー（parent_idがNullのもの）を取得
        root_menus = Menu.query.filter_by(parent_id=None, is_active=True).order_by(Menu.order_index).all()
        return jsonify([menu.to_dict() for menu in root_menus])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@menus_bp.route('', methods=['POST'])
@cross_origin()
@require_auth
@require_role('editor')
def create_menu():
    """新しいメニュー項目を作成"""
    try:
        data = request.get_json()
        if not data or not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        title = data['title']
        page_id = data.get('page_id')
        parent_id = data.get('parent_id')
        
        # ページIDが指定されている場合、存在確認
        if page_id:
            page = Page.query.get(page_id)
            if not page:
                return jsonify({'error': 'Page not found'}), 404
        
        # 親メニューが指定されている場合、存在確認
        if parent_id:
            parent_menu = Menu.query.get(parent_id)
            if not parent_menu:
                return jsonify({'error': 'Parent menu not found'}), 404
        
        # 同じ親の下での最大order_indexを取得
        max_order = db.session.query(db.func.max(Menu.order_index)).filter_by(parent_id=parent_id).scalar() or 0
        
        menu = Menu(
            title=title,
            page_id=page_id,
            parent_id=parent_id,
            order_index=max_order + 1
        )
        
        db.session.add(menu)
        db.session.commit()
        
        return jsonify(menu.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@menus_bp.route('/<int:menu_id>', methods=['PUT'])
@cross_origin()
@require_auth
@require_role('editor')
def update_menu(menu_id):
    """メニュー項目を更新"""
    try:
        menu = Menu.query.get(menu_id)
        if not menu:
            return jsonify({'error': 'Menu not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # タイトルの更新
        if 'title' in data:
            menu.title = data['title']
        
        # ページIDの更新
        if 'page_id' in data:
            page_id = data['page_id']
            if page_id:
                page = Page.query.get(page_id)
                if not page:
                    return jsonify({'error': 'Page not found'}), 404
            menu.page_id = page_id
        
        # アクティブ状態の更新
        if 'is_active' in data:
            menu.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify(menu.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@menus_bp.route('/<int:menu_id>', methods=['DELETE'])
@cross_origin()
@require_auth
@require_role('editor')
def delete_menu(menu_id):
    """メニュー項目を削除"""
    try:
        menu = Menu.query.get(menu_id)
        if not menu:
            return jsonify({'error': 'Menu not found'}), 404
        
        # 子メニューがある場合は削除を拒否
        if menu.children:
            return jsonify({'error': 'Cannot delete menu with children. Delete children first.'}), 400
        
        db.session.delete(menu)
        db.session.commit()
        
        return jsonify({'message': 'Menu deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@menus_bp.route('/reorder', methods=['PUT'])
@cross_origin()
@require_auth
@require_role('editor')
def reorder_menus():
    """メニューの順序を変更"""
    try:
        data = request.get_json()
        if not data or 'menus' not in data:
            return jsonify({'error': 'Menu order data is required'}), 400
        
        menu_orders = data['menus']  # [{'id': 1, 'order_index': 0, 'parent_id': None}, ...]
        
        for menu_data in menu_orders:
            menu_id = menu_data.get('id')
            order_index = menu_data.get('order_index')
            parent_id = menu_data.get('parent_id')
            
            if menu_id is None or order_index is None:
                continue
            
            menu = Menu.query.get(menu_id)
            if menu:
                menu.order_index = order_index
                menu.parent_id = parent_id
        
        db.session.commit()
        
        return jsonify({'message': 'Menu order updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@menus_bp.route('/<int:menu_id>/move', methods=['PUT'])
@cross_origin()
@require_auth
@require_role('editor')
def move_menu(menu_id):
    """メニュー項目を移動"""
    try:
        menu = Menu.query.get(menu_id)
        if not menu:
            return jsonify({'error': 'Menu not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        new_parent_id = data.get('parent_id')
        new_order_index = data.get('order_index')
        
        # 新しい親メニューの存在確認
        if new_parent_id:
            parent_menu = Menu.query.get(new_parent_id)
            if not parent_menu:
                return jsonify({'error': 'Parent menu not found'}), 404
            
            # 循環参照のチェック
            def is_descendant(menu_id, potential_ancestor_id):
                if menu_id == potential_ancestor_id:
                    return True
                menu = Menu.query.get(menu_id)
                if menu and menu.parent_id:
                    return is_descendant(menu.parent_id, potential_ancestor_id)
                return False
            
            if is_descendant(new_parent_id, menu_id):
                return jsonify({'error': 'Cannot move menu to its own descendant'}), 400
        
        # 古い位置から削除するために、同じ親の他のメニューの順序を調整
        old_parent_id = menu.parent_id
        old_order_index = menu.order_index
        
        # 古い親の下で、削除されるメニューより後ろのメニューの順序を1つ前に
        Menu.query.filter(
            Menu.parent_id == old_parent_id,
            Menu.order_index > old_order_index
        ).update({Menu.order_index: Menu.order_index - 1})
        
        # 新しい親の下で、挿入位置以降のメニューの順序を1つ後ろに
        if new_order_index is not None:
            Menu.query.filter(
                Menu.parent_id == new_parent_id,
                Menu.order_index >= new_order_index
            ).update({Menu.order_index: Menu.order_index + 1})
        else:
            # 順序が指定されていない場合は最後に追加
            max_order = db.session.query(db.func.max(Menu.order_index)).filter_by(parent_id=new_parent_id).scalar() or 0
            new_order_index = max_order + 1
        
        # メニューを新しい位置に移動
        menu.parent_id = new_parent_id
        menu.order_index = new_order_index
        
        db.session.commit()
        
        return jsonify(menu.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

