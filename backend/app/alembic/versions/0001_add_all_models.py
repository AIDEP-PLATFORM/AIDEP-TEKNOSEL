# Bu dosya "veritabanında ne oluşturulacak, nasıl geri alınacak" talimatlarını içeriyor.

from typing import Sequence, Union

import geoalchemy2
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostGIS eklentisi (yoksa oluştur)
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # ------------------------------------------------------------------ users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="citizen"),
        sa.Column("organization", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"])

    # --------------------------------------------------------------- earthquakes
    op.create_table(
        "earthquakes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("magnitude", sa.Float(), nullable=False),
        sa.Column("depth_km", sa.Float(), nullable=True),
        sa.Column(
            "location",
            geoalchemy2.types.Geography(
                geometry_type="POINT", srid=4326, spatial_index=False
            ),
            nullable=False,
        ),
        sa.Column("location_name", sa.String(255), nullable=True),
        sa.Column("source", sa.String(100), nullable=False),
        sa.Column("event_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_earthquakes_id", "earthquakes", ["id"])
    op.create_index("ix_earthquakes_event_time", "earthquakes", ["event_time"])
    op.create_index(
        "ix_earthquakes_location_gist", "earthquakes", ["location"], postgresql_using="gist"
    )

    # ---------------------------------------------------------------- requests
    op.create_table(
        "requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "location",
            geoalchemy2.types.Geography(
                geometry_type="POINT", srid=4326, spatial_index=False
            ),
            nullable=False,
        ),
        sa.Column("xgboost_score", sa.Float(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("urgency", sa.String(50), nullable=True),
        sa.Column("needs", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_requests_id", "requests", ["id"])
    op.create_index("ix_requests_user_id", "requests", ["user_id"])
    op.create_index("ix_requests_status", "requests", ["status"])
    op.create_index(
        "ix_requests_location_gist", "requests", ["location"], postgresql_using="gist"
    )

    # ------------------------------------------------------------ damage_reports
    op.create_table(
        "damage_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "location",
            geoalchemy2.types.Geography(
                geometry_type="POINT", srid=4326, spatial_index=False
            ),
            nullable=False,
        ),
        sa.Column("photo_url", sa.String(), nullable=False),
        sa.Column(
            "analysis_results",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "status", sa.String(50), nullable=False, server_default="analyzing"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_damage_reports_id", "damage_reports", ["id"])
    op.create_index("ix_damage_reports_user_id", "damage_reports", ["user_id"])
    op.create_index("ix_damage_reports_status", "damage_reports", ["status"])
    op.create_index(
        "ix_damage_reports_location_gist",
        "damage_reports",
        ["location"],
        postgresql_using="gist",
    )

    # -------------------------------------------------------------- volunteers
    op.create_table(
        "volunteers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "skills",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default="{}",
        ),
        sa.Column(
            "current_location",
            geoalchemy2.types.Geography(
                geometry_type="POINT", srid=4326, spatial_index=False
            ),
            nullable=True,
        ),
        sa.Column(
            "is_available", sa.Boolean(), nullable=False, server_default="true"
        ),
        sa.Column("status", sa.String(50), nullable=False, server_default="active"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_volunteers_id", "volunteers", ["id"])
    op.create_index("ix_volunteers_availability", "volunteers", ["is_available"])
    op.create_index(
        "ix_volunteers_location_gist",
        "volunteers",
        ["current_location"],
        postgresql_using="gist",
    )

    # ------------------------------------------------------------------ routes
    op.create_table(
        "routes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("request_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("volunteer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "path",
            geoalchemy2.types.Geography(
                geometry_type="LINESTRING", srid=4326, spatial_index=False
            ),
            nullable=False,
        ),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("distance_meters", sa.Float(), nullable=True),
        sa.Column("risk_score", sa.Float(), nullable=True),
        sa.Column(
            "status", sa.String(50), nullable=False, server_default="calculated"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["request_id"], ["requests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["volunteer_id"], ["volunteers.user_id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_routes_id", "routes", ["id"])
    op.create_index("ix_routes_request_id", "routes", ["request_id"])
    op.create_index("ix_routes_volunteer_id", "routes", ["volunteer_id"])
    op.create_index(
        "ix_routes_path_gist", "routes", ["path"], postgresql_using="gist"
    )

    # -------------------------------------------------------------- audit_logs
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource", sa.String(100), nullable=False),
        sa.Column("details", sa.String(), nullable=True),
        sa.Column(
            "timestamp",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_id", "audit_logs", ["id"])
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_timestamp", "audit_logs", ["timestamp"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("routes")
    op.drop_table("volunteers")
    op.drop_table("damage_reports")
    op.drop_table("requests")
    op.drop_table("earthquakes")
    op.drop_table("users")
    op.execute("DROP EXTENSION IF EXISTS postgis")
