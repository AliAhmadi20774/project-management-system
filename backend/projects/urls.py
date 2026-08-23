from rest_framework.routers import DefaultRouter

from .views import ProjectMembershipViewSet, ProjectViewSet, TaskViewSet, TimeEntryViewSet

router = DefaultRouter()
router.register('projects', ProjectViewSet, basename='project')
router.register('project-memberships', ProjectMembershipViewSet, basename='project-membership')
router.register('tasks', TaskViewSet, basename='task')
router.register('time-entries', TimeEntryViewSet, basename='time-entry')

urlpatterns = router.urls
