"""Add alerts table and missing metadata columns

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-17 19:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to include alerts and late-phase metadata columns."""
    # 1. Add missing columns to existing tables
    op.add_column('users', sa.Column('account_status', sa.String(length=50), server_default='Normal', nullable=False))
    op.add_column('surveys', sa.Column('country', sa.String(length=100), server_default='Tanzania', nullable=True))
    op.add_column('devices', sa.Column('created_by', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_devices_created_by_users', 'devices', 'users', ['created_by'], ['id'])

    # 2. Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('alert_type', sa.String(length=50), nullable=False),
        sa.Column('severity', sa.String(length=20), server_default='HIGH', nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('target_role', sa.String(length=50), server_default='Admin', nullable=False),
        sa.Column('site_id', sa.Integer(), nullable=True),
        sa.Column('device_id', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], ),
        sa.ForeignKeyConstraint(['site_id'], ['monitoring_sites.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alerts_id'), 'alerts', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_alerts_id'), table_name='alerts')
    op.drop_table('alerts')
    op.drop_constraint('fk_devices_created_by_users', 'devices', type_='foreignkey')
    op.drop_column('devices', 'created_by')
    op.drop_column('surveys', 'country')
    op.drop_column('users', 'account_status')
