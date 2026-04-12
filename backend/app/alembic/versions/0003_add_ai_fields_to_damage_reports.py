"""add ai fields to damage_reports

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-12
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("damage_reports", sa.Column("description", sa.String(1000), nullable=True))
    op.add_column("damage_reports", sa.Column("damage_class", sa.String(50), nullable=True))
    op.add_column("damage_reports", sa.Column("severity", sa.Integer(), nullable=True))
    op.add_column("damage_reports", sa.Column("priority_score", sa.Float(), nullable=True))

    op.create_index("ix_damage_reports_severity", "damage_reports", ["severity"])
    op.create_index("ix_damage_reports_damage_class", "damage_reports", ["damage_class"])


def downgrade() -> None:
    op.drop_index("ix_damage_reports_damage_class", table_name="damage_reports")
    op.drop_index("ix_damage_reports_severity", table_name="damage_reports")

    op.drop_column("damage_reports", "priority_score")
    op.drop_column("damage_reports", "severity")
    op.drop_column("damage_reports", "damage_class")
    op.drop_column("damage_reports", "description")
