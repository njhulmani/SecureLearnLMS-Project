from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from accounts.models import RegistrationRequest, User


class RegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = ['first_name', 'last_name', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_email(self, value):
        normalized = value.strip().lower()

        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('Email already exists.')

        if RegistrationRequest.objects.filter(email__iexact=normalized, status=RegistrationRequest.StatusChoices.PENDING).exists():
            raise serializers.ValidationError('A pending registration request already exists for this email.')

        return normalized

    def validate_role(self, value):
        if value not in {'student', 'trainer'}:
            raise serializers.ValidationError('Only student and trainer roles can register.')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        validated_data['first_name'] = validated_data['first_name'].strip()
        validated_data['last_name'] = validated_data['last_name'].strip()
        validated_data['email'] = validated_data['email'].strip().lower()
        validated_data['password'] = make_password(validated_data['password'])
        return RegistrationRequest.objects.create(**validated_data)


class RegistrationRequestListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    request_date = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = RegistrationRequest
        fields = ['id', 'name', 'first_name', 'last_name', 'email', 'role', 'status', 'request_date']

    def get_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()