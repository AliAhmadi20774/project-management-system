from rest_framework.routers import DefaultRouter

from .views import CalendarEventViewSet, ProjectMembershipViewSet, ProjectViewSet, TaskViewSet, TimeEntryViewSet, WorkLogViewSet

router = DefaultRouter()
router.register('projects', ProjectViewSet, basename='project')
router.register('project-memberships', ProjectMembershipViewSet, basename='project-membership')
router.register('tasks', TaskViewSet, basename='task')
router.register('time-entries', TimeEntryViewSet, basename='time-entry')
router.register('work-logs', WorkLogViewSet, basename='work-log')
router.register('calendar-events', CalendarEventViewSet, basename='calendar-event')

urlpatterns = router.urls
