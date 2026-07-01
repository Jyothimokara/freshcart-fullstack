import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    """Custom manager for the User model where email is the unique identifier."""
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, name, password, **extra_fields)

class User(AbstractUser):
    """Custom User model with email as USERNAME_FIELD and UUID as primary key."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None  # Remove username field
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=255)
    avatar = models.CharField(max_length=500, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

class Address(models.Model):
    """Model representing user shipping/billing addresses."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    street = models.TextField()
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    zip_code = models.CharField(max_length=20)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "addresses"
        ordering = ['-is_default', 'id']

    def save(self, *args, **kwargs):
        # Ensure only one address is default
        if self.is_default:
            Address.objects.filter(user=self.user).exclude(id=self.id).update(is_default=False)
        else:
            # If this is the user's first address, make it the default
            if not Address.objects.filter(user=self.user).exclude(id=self.id).exists():
                self.is_default = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} - {self.street}, {self.city}"
