#!/bin/bash
# =============================================================================
# Microsistemas - MySQL non-root user init script
# =============================================================================
# Mounted at: /docker-entrypoint-initdb.d/01-init.sh
# Runs once on first container start (when data volume is empty).
#
# Creates a least-privilege application user if DB_APP_USER and DB_APP_PASS
# are defined. Safe to omit -- container works normally without them.
# =============================================================================
set -e

if [ -z "$DB_APP_USER" ] || [ -z "$DB_APP_PASS" ]; then
    echo "[init-db] DB_APP_USER or DB_APP_PASS not set -- skipping non-root user creation."
    exit 0
fi

DB="${MYSQL_DATABASE:-portal_portafolio}"

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    CREATE USER IF NOT EXISTS '${DB_APP_USER}'@'%' IDENTIFIED BY '${DB_APP_PASS}';
    GRANT SELECT, INSERT, UPDATE, DELETE ON \`${DB}\`.* TO '${DB_APP_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "[init-db] User '${DB_APP_USER}' created with SELECT/INSERT/UPDATE/DELETE on '${DB}'."
