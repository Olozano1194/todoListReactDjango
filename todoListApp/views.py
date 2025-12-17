from rest_framework import viewsets, status
from rest_framework.response import Response
from .serializers import TaskSerializer
from .models import Task
#Para las filtraciones en la base de datos
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter


# Create your views here.
#clase para el crud de tareas
class TaskViewSet(viewsets.ModelViewSet):
   serializer_class = TaskSerializer
   queryset = Task.objects.all()
   filter_backends = [DjangoFilterBackend, SearchFilter]
   search_fields = ['description']
   # filterset_fields = ['completed']

   #esta clase nos sirve para listar los usuarios
   def list(self,request):
      try:
         queryset = self.filter_queryset(self.get_queryset())
         queryset = queryset.order_by('-id')
         serializer = self.get_serializer(queryset, many=True)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Exception as e:
         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)