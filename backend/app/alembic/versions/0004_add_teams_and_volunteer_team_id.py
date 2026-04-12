"""add teams table and volunteer team_id

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-12
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # teams tablosu
    op.create_table(
        "teams",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("organization", sa.String(255), nullable=False),
        sa.Column("max_size", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("status", sa.String(50), nullable=False, server_default="available"),
        sa.Column("assigned_damage_id", UUID(as_uuid=True),
                  sa.ForeignKey("damage_reports.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_by", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Geography kolonu ve GIST index ayrı SQL ile eklenir
    op.execute("""
        ALTER TABLE teams
        ADD COLUMN current_location geography(POINT, 4326)
    """)
    op.execute("CREATE INDEX ix_teams_location_gist ON teams USING gist (current_location)")
    op.create_index("ix_teams_status", "teams", ["status"])
    op.create_index("ix_teams_organization", "teams", ["organization"])

    # volunteers tablosuna team_id ekle
    op.add_column("volunteers", sa.Column(
        "team_id", UUID(as_uuid=True),
        sa.ForeignKey("teams.id", ondelete="SET NULL"),
        nullable=True
    ))
    op.create_index("ix_volunteers_team_id", "volunteers", ["team_id"])


def downgrade() -> None:
    op.drop_index("ix_volunteers_team_id", table_name="volunteers")
    op.drop_column("volunteers", "team_id")

    op.drop_index("ix_teams_location_gist", table_name="teams")
    op.drop_index("ix_teams_organization", table_name="teams")
    op.drop_index("ix_teams_status", table_name="teams")
    op.drop_table("teams")
