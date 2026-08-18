"""Add area_sq_km to monitoring_sites

Revision ID: a1b2c3d4e5f6
Revises: 7e5d08430e28
Create Date: 2026-07-29 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '7e5d08430e28'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('monitoring_sites', sa.Column('area_sq_km', sa.Float(), nullable=True, server_default='1.0'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('monitoring_sites', 'area_sq_km')
