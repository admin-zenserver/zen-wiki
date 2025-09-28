from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    discord_id = db.Column(db.String(50), unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    avatar_url = db.Column(db.String(500))
    role = db.Column(db.String(20), default='viewer')  # viewer, editor, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))  # IPv6対応
    user_agent = db.Column(db.String(500))
    
    # リレーション
    pages = db.relationship('Page', backref='author', lazy=True)
    page_histories = db.relationship('PageHistory', backref='author', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'discord_id': self.discord_id,
            'username': self.username,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Page(db.Model):
    __tablename__ = 'pages'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, default='')
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_published = db.Column(db.Boolean, default=True)
    
    # リレーション
    histories = db.relationship('PageHistory', backref='page', lazy=True, cascade='all, delete-orphan')
    menu_items = db.relationship('Menu', backref='page', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'author': self.author.username if self.author else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_published': self.is_published
        }

class Menu(db.Model):
    __tablename__ = 'menus'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    page_id = db.Column(db.Integer, db.ForeignKey('pages.id'), nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('menus.id'), nullable=True)
    order_index = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    # 自己参照リレーション
    children = db.relationship('Menu', backref=db.backref('parent', remote_side=[id]), lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'page_id': self.page_id,
            'page_slug': self.page.slug if self.page else None,
            'parent_id': self.parent_id,
            'order_index': self.order_index,
            'is_active': self.is_active,
            'children': [child.to_dict() for child in sorted(self.children, key=lambda x: x.order_index)]
        }

class PageHistory(db.Model):
    __tablename__ = 'page_histories'
    
    id = db.Column(db.Integer, primary_key=True)
    page_id = db.Column(db.Integer, db.ForeignKey('pages.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'page_id': self.page_id,
            'content': self.content,
            'author': self.author.username if self.author else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

