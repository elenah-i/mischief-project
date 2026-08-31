print('!!!! WSGI FILE VERSION CHECK 12345 IS RUNNING !!!!', flush=True)
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
# Belt-and-suspenders: run migrations here too, not just in entrypoint.sh. try: from django.core.management import call_command print('[startup] running migrate...', flush=True) call_command('migrate', interactive=False) print('[startup] migrate complete.', flush=True) except Exception as exc: print(f'[startup] migrate failed (may be a harmless race, will retry on next worker/restart): {exc}', flush=True)
