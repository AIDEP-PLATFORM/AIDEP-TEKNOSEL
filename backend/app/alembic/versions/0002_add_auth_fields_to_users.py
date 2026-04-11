"""add auth fields to users

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-11
"""

from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone", sa.String(20), nullable=True))
    op.add_column("users", sa.Column("tc_no", sa.String(11), nullable=True))
    op.add_column("users", sa.Column("full_name", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("city", sa.String(100), nullable=True))
    op.add_column("users", sa.Column("password_hash", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"))

    op.create_index("ix_users_tc_no", "users", ["tc_no"], unique=True)
    op.create_index("ix_users_phone", "users", ["phone"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_phone", table_name="users")
    op.drop_index("ix_users_tc_no", table_name="users")

    op.drop_column("users", "is_active")
    op.drop_column("users", "password_hash")
    op.drop_column("users", "city")
    op.drop_column("users", "full_name")
    op.drop_column("users", "tc_no")
    op.drop_column("users", "phone")
