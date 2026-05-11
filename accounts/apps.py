from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):

        from django.contrib.auth import get_user_model

        User = get_user_model()

        try:
            if not User.objects.filter(username='admin').exists():

                User.objects.create_superuser(
                    username='admin',
                    email='admin@gmail.com',
                    password='admin123'
                )

                print("Superuser created successfully.")

        except Exception as e:
            print("Superuser creation skipped:", e)