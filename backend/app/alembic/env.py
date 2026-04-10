# alembic upgrade head çalıştırınca ilk bu dosya çalışır. Veritabanına nasıl bağlanılacağını ve migration'ların nasıl işletileceğini ayarlar.
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from geoalchemy2 import alembic_helpers
from app.core.config import settings
from app.models import Base

config = context.config

if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Use sync URL and change port from 6543 (transactional pooler) to 5432 (session pooler / direct)
# This is explicitly required because Supabase pgBouncer on 6543 doesn't support some DDL / prepared statements.
alembic_url = settings.DATABASE_URL_SYNC.replace(":6543", ":5432")
config.set_main_option("sqlalchemy.url", alembic_url)

def run_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=alembic_helpers.include_object,
        render_item=alembic_helpers.render_item,
        process_revision_directives=alembic_helpers.writer,
    )

    with context.begin_transaction():
        context.run_migrations()

def run_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=alembic_helpers.include_object,
            render_item=alembic_helpers.render_item,
            process_revision_directives=alembic_helpers.writer,
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_offline()
else:
    run_online()
