from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import User, Address

class CustomUserCreationForm(forms.ModelForm):
    """Form to create users inside the Django Admin panel without username dependency."""
    password = forms.CharField(widget=forms.PasswordInput, label="Password")

    class Meta:
        model = User
        fields = ('email', 'name')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

class CustomUserChangeForm(forms.ModelForm):
    """Form to edit users inside the Django Admin panel, rendering passwords as secure read-only hashes."""
    password = ReadOnlyPasswordHashField(
        label="Password",
        help_text=(
            "Raw passwords are not stored, so there is no way to see this user's password. "
            "You can change the password using the user change page actions."
        ),
    )

    class Meta:
        model = User
        fields = ('email', 'name', 'avatar', 'is_active', 'is_staff', 'is_superuser')

class CustomUserAdmin(UserAdmin):
    """Django Admin setup for custom email-only User models."""
    model = User
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ('email', 'name', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password'),
        }),
    )

    search_fields = ('email', 'name')
    ordering = ('email',)

class AddressAdmin(admin.ModelAdmin):
    """Admin configuration for User Address model."""
    list_display = ('full_name', 'user', 'city', 'state', 'is_default')
    list_filter = ('is_default', 'state', 'city')
    search_fields = ('full_name', 'phone', 'street', 'city', 'zip_code')
    raw_id_fields = ('user',)

admin.site.register(User, CustomUserAdmin)
admin.site.register(Address, AddressAdmin)
