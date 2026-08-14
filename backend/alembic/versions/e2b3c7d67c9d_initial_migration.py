"""Initial migration tables creation

Revision ID: e2b3c7d67c9d
Revises: 
Create Date: 2026-07-10 21:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e2b3c7d67c9d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # 2. surveys table
    op.create_table(
        'surveys',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_by_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_surveys_id'), 'surveys', ['id'], unique=False)
    op.create_index(op.f('ix_surveys_name'), 'surveys', ['name'], unique=False)

    # 3. monitoring_sites table
    op.create_table(
        'monitoring_sites',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('habitat_type', sa.String(length=50), nullable=False),
        sa.Column('survey_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_monitoring_sites_id'), 'monitoring_sites', ['id'], unique=False)
    op.create_index(op.f('ix_monitoring_sites_name'), 'monitoring_sites', ['name'], unique=False)

    # 4. camera_traps table
    op.create_table(
        'camera_traps',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('model', sa.String(length=255), nullable=False),
        sa.Column('serial_number', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('site_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['site_id'], ['monitoring_sites.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_camera_traps_id'), 'camera_traps', ['id'], unique=False)
    op.create_index(op.f('ix_camera_traps_serial_number'), 'camera_traps', ['serial_number'], unique=True)

    # 5. audio_sensors table
    op.create_table(
        'audio_sensors',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('model', sa.String(length=255), nullable=False),
        sa.Column('serial_number', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('site_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['site_id'], ['monitoring_sites.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audio_sensors_id'), 'audio_sensors', ['id'], unique=False)
    op.create_index(op.f('ix_audio_sensors_serial_number'), 'audio_sensors', ['serial_number'], unique=True)

    # 6. observations table
    op.create_table(
        'observations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('species', sa.String(length=255), nullable=False),
        sa.Column('count', sa.Integer(), nullable=False),
        sa.Column('observed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('notes', sa.String(length=2000), nullable=True),
        sa.Column('site_id', sa.UUID(), nullable=False),
        sa.Column('reporter_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['reporter_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['site_id'], ['monitoring_sites.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_observations_id'), 'observations', ['id'], unique=False)
    op.create_index(op.f('ix_observations_species'), 'observations', ['species'], unique=False)

    # 7. media table
    op.create_table(
        'media',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('observation_id', sa.UUID(), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_url', sa.String(length=1000), nullable=False),
        sa.Column('public_id', sa.String(length=255), nullable=True),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['observation_id'], ['observations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_media_id'), 'media', ['id'], unique=False)
    op.create_index(op.f('ix_media_observation_id'), 'media', ['observation_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_media_observation_id'), table_name='media')
    op.drop_index(op.f('ix_media_id'), table_name='media')
    op.drop_table('media')
    
    op.drop_index(op.f('ix_observations_species'), table_name='observations')
    op.drop_index(op.f('ix_observations_id'), table_name='observations')
    op.drop_table('observations')
    
    op.drop_index(op.f('ix_audio_sensors_serial_number'), table_name='audio_sensors')
    op.drop_index(op.f('ix_audio_sensors_id'), table_name='audio_sensors')
    op.drop_table('audio_sensors')
    
    op.drop_index(op.f('ix_camera_traps_serial_number'), table_name='camera_traps')
    op.drop_index(op.f('ix_camera_traps_id'), table_name='camera_traps')
    op.drop_table('camera_traps')
    
    op.drop_index(op.f('ix_monitoring_sites_name'), table_name='monitoring_sites')
    op.drop_index(op.f('ix_monitoring_sites_id'), table_name='monitoring_sites')
    op.drop_table('monitoring_sites')
    
    op.drop_index(op.f('ix_surveys_name'), table_name='surveys')
    op.drop_index(op.f('ix_surveys_id'), table_name='surveys')
    op.drop_table('surveys')
    
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
