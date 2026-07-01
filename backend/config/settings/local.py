import dj_database_url
from .base import *

DB_ENGINE = os.environ.get('DB_ENGINE', 'postgresql').lower()

if os.environ.get('DATABASE_URL'):
    # Parse production DATABASE_URL (standard for Render PostgreSQL)
    DATABASES = {
        'default': dj_database_url.config(
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=os.environ.get('DB_SSL_REQUIRE', 'False').lower() in ('true', '1', 't')
        )
    }
elif DB_ENGINE == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'freshcart'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
            'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }
