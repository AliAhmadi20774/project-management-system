from rest_framework.routers import DefaultRouter

from .views import PersonalNoteViewSet

router = DefaultRouter()
router.register('notes', PersonalNoteViewSet, basename='note')

urlpatterns = router.urls
