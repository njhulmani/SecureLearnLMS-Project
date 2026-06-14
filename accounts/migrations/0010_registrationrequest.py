from django.db import migrations, models


class Migration(migrations.Migration):

	dependencies = [
		('accounts', '0009_passwordresettoken_expires_at'),
	]

	operations = [
		migrations.CreateModel(
			name='RegistrationRequest',
			fields=[
				('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
				('first_name', models.CharField(max_length=150)),
				('last_name', models.CharField(max_length=150)),
				('email', models.EmailField(db_index=True, max_length=254)),
				('password', models.CharField(max_length=128)),
				('role', models.CharField(choices=[('trainer', 'Trainer'), ('student', 'Student')], max_length=10)),
				('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], db_index=True, default='pending', max_length=20)),
				('created_at', models.DateTimeField(auto_now_add=True)),
				('updated_at', models.DateTimeField(auto_now=True)),
			],
			options={
				'ordering': ['-created_at'],
			},
		),
		migrations.AddConstraint(
			model_name='registrationrequest',
			constraint=models.UniqueConstraint(fields=('email', 'status'), name='unique_registration_request_email_status'),
		),
	]
