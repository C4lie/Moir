class DisableCSRFOnAPI:
    """
    Middleware to disable CSRF protection for API endpoints.
    This allows the frontend to make API requests without CSRF tokens.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return self.get_response(request)
