#!/bin/sh
set -eu

iconv -f UTF-16LE -t UTF-8 /seed/db_penggajian3.sql | mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}"
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" < /seed/001_create_overtime_table.sql