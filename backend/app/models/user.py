from tortoise import fields
from tortoise.models import Model

from app.models.roles import UserRole


class User(Model):
    id = fields.IntField(pk=True)

    username = fields.CharField(max_length=50, unique=True)
    email = fields.CharField(max_length=100, unique=True)

    hashed_password = fields.CharField(max_length=255)

    role = fields.CharEnumField(UserRole)

    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "users"