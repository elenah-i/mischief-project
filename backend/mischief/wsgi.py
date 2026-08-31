"""
WSGI config for mischief project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mischief.settings')

application = get_wsgi_application()

# Belt-and-suspenders: run migrations here too, not just in entrypoint.sh.
# Multiple gunicorn workers all import this module independently, so
# without coordination they'd all try to migrate at the same moment -
# tested and confirmed this actually corrupts the schema (not just a
# harmless duplicate error), so on Postgres we gate it behind an advisory
# lock: only the worker that wins the lock runs migrate, the rest skip.
try:
    from django.core.management import call_command
    from django.db import connection

    if connection.vendor == 'postgresql':
        with connection.cursor() as cursor:
            cursor.execute('SELECT pg_try_advisory_lock(727384910)')
            got_lock = cursor.fetchone()[0]
    else:
        got_lock = True

    if got_lock:
        print('[startup] got migration lock, running migrate...', flush=True)
        call_command('migrate', interactive=False)
        print('[startup] migrate complete.', flush=True)
        if connection.vendor == 'postgresql':
            with connection.cursor() as cursor:
                cursor.execute('SELECT pg_advisory_unlock(727384910)')
    else:
        print('[startup] another worker is migrating, skipping.', flush=True)
except Exception as exc:
    print(f'[startup] migrate step failed: {exc}', flush=True)
