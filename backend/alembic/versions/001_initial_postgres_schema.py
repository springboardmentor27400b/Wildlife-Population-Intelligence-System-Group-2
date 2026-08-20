from alembic import op
import sqlalchemy as sa

revision = '001_initial_postgres_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table(
        'monitoring_sites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('site_name', sa.String(length=255), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('habitat', sa.String(length=255), nullable=False),
        sa.Column('country', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_monitoring_sites_id'), 'monitoring_sites', ['id'], unique=False)

    op.create_table(
        'species',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('common_name', sa.String(length=255), nullable=False),
        sa.Column('scientific_name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('iucn_status', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_species_id'), 'species', ['id'], unique=False)

    op.create_table(
        'species_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('common_name', sa.String(length=255), nullable=False),
        sa.Column('scientific_name', sa.String(length=255), nullable=True),
        sa.Column('family', sa.String(length=255), nullable=True),
        sa.Column('genus', sa.String(length=255), nullable=True),
        sa.Column('habitat', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=255), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_species_records_id'), 'species_records', ['id'], unique=False)

    op.create_table(
        'surveys',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('site_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('survey_date', sa.Date(), nullable=False),
        sa.Column('device', sa.String(length=255), nullable=False),
        sa.Column('remarks', sa.String(length=1000), nullable=True),
        sa.ForeignKeyConstraint(['site_id'], ['monitoring_sites.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_surveys_id'), 'surveys', ['id'], unique=False)

    op.create_table(
        'audio_detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('audio_path', sa.String(length=500), nullable=False),
        sa.Column('species', sa.String(length=255), nullable=True),
        sa.Column('confidence', sa.String(length=50), nullable=True),
        sa.Column('duration', sa.String(length=50), nullable=True),
        sa.Column('frequency', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_audio_detections_id'), 'audio_detections', ['id'], unique=False)
    op.create_index(op.f('ix_audio_detections_user_id'), 'audio_detections', ['user_id'], unique=False)

    op.create_table(
        'image_detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('image_path', sa.String(length=500), nullable=False),
        sa.Column('species', sa.String(length=255), nullable=True),
        sa.Column('confidence', sa.String(length=50), nullable=True),
        sa.Column('bounding_box', sa.String(length=255), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_image_detections_id'), 'image_detections', ['id'], unique=False)
    op.create_index(op.f('ix_image_detections_user_id'), 'image_detections', ['user_id'], unique=False)

    op.create_table(
        'wildlife_audio',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('audio_path', sa.String(length=500), nullable=False),
        sa.Column('species', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_wildlife_audio_id'), 'wildlife_audio', ['id'], unique=False)

    op.create_table(
        'wildlife_images',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('image_path', sa.String(length=500), nullable=False),
        sa.Column('species', sa.String(length=255), nullable=True),
        sa.Column('confidence', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_wildlife_images_id'), 'wildlife_images', ['id'], unique=False)

    op.create_table(
        'observations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('species_id', sa.Integer(), nullable=False),
        sa.Column('site_id', sa.Integer(), nullable=False),
        sa.Column('observation_date', sa.Date(), nullable=False),
        sa.Column('count', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['site_id'], ['monitoring_sites.id']),
        sa.ForeignKeyConstraint(['species_id'], ['species.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_observations_id'), 'observations', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('observations')
    op.drop_table('wildlife_images')
    op.drop_table('wildlife_audio')
    op.drop_table('image_detections')
    op.drop_table('audio_detections')
    op.drop_table('surveys')
    op.drop_table('species_records')
    op.drop_table('species')
    op.drop_table('monitoring_sites')
    op.drop_table('users')
