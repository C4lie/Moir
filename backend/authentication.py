from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication without CSRF checks.
    Use this for API endpoints to allow frontend requests without CSRF tokens.
    """
    def enforce_csrf(self, request):
        pass  # Skip CSRF check completely
