import re
from app.core.exceptions import BadRequestException

def validate_coordinates(latitude: float, longitude: float):
    """Ensure coordinates are within realistic bounds (-90 to 90, -180 to 180)."""
    if not (-90.0 <= latitude <= 90.0):
        raise BadRequestException("Latitude must be between -90 and 90 degrees")
    if not (-180.0 <= longitude <= 180.0):
        raise BadRequestException("Longitude must be between -180 and 180 degrees")

def validate_password_strength(password: str):
    """Require minimum 6 characters password."""
    if len(password) < 6:
        raise BadRequestException("Password must be at least 6 characters long")

def validate_email_format(email: str):
    """Basic regular expression format check."""
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.match(pattern, email):
        raise BadRequestException("Invalid email format")
