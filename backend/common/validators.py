# common/validators.py

from django.core.exceptions import ValidationError


def validate_positive(value):
    if value <= 0:
        raise ValidationError(f"{value} must be a positive number.")


def validate_capacity_range(min_capacity, max_capacity):
    if min_capacity > max_capacity:
        raise ValidationError("Minimum capacity cannot be greater than maximum capacity.")


def validate_semester(value):
    valid = ["Fall", "Spring", "Summer"]
    if value not in valid:
        raise ValidationError(f"{value} is not a valid semester.")
