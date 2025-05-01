from django.shortcuts import render
from rest_framework.generics import ListAPIView, CreateAPIView
from authentication.authentication import JWTCookieAuthentication
from rest_framework.permissions import IsAuthenticated
from .serializers import SlotSerializer, TeacherSlotAssignmentSerializer
from .models import Slot
from teacher.models import Teacher
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status
from .models import TeacherSlotAssignment

# Create your views here.
class SlotListView(ListAPIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = SlotSerializer

    def get_queryset(self):
        slots = Slot.objects.filter()

        return slots

'''
Request should be like:
{
    "teacher_id": 1,
    "slots": [
        {
            "slot_id": 1,
            "day_of_week": 0
        },
        {
            "slot_id": 1,
            "day_of_week": 0
        },
    ]
}
'''
class TeacherSlotPreferenceView(CreateAPIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = SlotSerializer

    def post(self, request, *args, **kwargs):
        try:
            teacher = Teacher.objects.get(teacher_id=request.data.get('teacher_id'))
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found."}, status=status.HTTP_404_NOT_FOUND)
        
        operations = request.data.get('operations', [])
        
        if not operations:
            return Response({"error": "No operations provided."}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        success_count = 0
        
        with transaction.atomic():
            for operation in operations:
                action = operation.get('action', 'create').lower()
                result = {
                    "action": action,
                    "slot_id": operation.get('slot_id'),
                    "day_of_week": operation.get('day_of_week'),
                    "success": False
                }
                
                try:
                    if action in ['create', 'update']:
                        response = self._handle_create_update(teacher, operation)
                    elif action == 'delete':
                        response = self._handle_delete(teacher, operation)
                    else:
                        raise DRFValidationError(f"Invalid action: {action}")
                    
                    result.update(response)
                    result["success"] = True
                    success_count += 1
                except (ValidationError, DRFValidationError) as e:
                    result["error"] = e.message_dict if hasattr(e, 'message_dict') else str(e)
                except Exception as e:
                    result["error"] = str(e)
                
                results.append(result)
        
        if success_count == 0:
            status_code = status.HTTP_400_BAD_REQUEST
        elif success_count == len(operations):
            status_code = status.HTTP_201_CREATED
        else:
            status_code = status.HTTP_207_MULTI_STATUS
        
        return Response(
            {
                "results": results,
                "success_count": success_count,
                "total_operations": len(operations)
            },
            status=status_code
        )

    def _handle_create_update(self, teacher, data):
        if 'slot_id' not in data or 'day_of_week' not in data:
            raise DRFValidationError("Both 'slot_id' and 'day_of_week' are required.")
        
        slot_id = data['slot_id']
        day_of_week = data['day_of_week']
        
        try:
            slot = Slot.objects.get(pk=slot_id)
        except Slot.DoesNotExist:
            raise DRFValidationError(f"Slot with id {slot_id} does not exist.")
        
        assignment, created = TeacherSlotAssignment.objects.get_or_create(
            teacher=teacher,
            day_of_week=day_of_week,
            defaults={'slot': slot}
        )
        
        if not created:
            assignment.slot = slot
            assignment.full_clean()
            assignment.save()
            action = "updated"
        else:
            action = "created"
        
        return {
            "message": f"Slot assignment {action} successfully.",
            "created": created
        }

    def _handle_delete(self, teacher, data):
        if 'slot_id' not in data or 'day_of_week' not in data:
            raise DRFValidationError("Both 'slot_id' and 'day_of_week' are required.")
        
        slot_id = data['slot_id']
        day_of_week = data['day_of_week']
        
        try:
            assignment = TeacherSlotAssignment.objects.get(
                teacher=teacher,
                slot_id=slot_id,
                day_of_week=day_of_week
            )
            assignment.delete()
            return {"message": "Slot assignment deleted successfully."}
        except TeacherSlotAssignment.DoesNotExist:
            raise DRFValidationError("Slot assignment not found.")
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = SlotSerializer

    def post(self, request, *args, **kwargs):
        try:
            teacher = Teacher.objects.get(teacher_id=request.data['teacher_id'])
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found."}, status=status.HTTP_404_NOT_FOUND)
        if not teacher:
            return Response({"error": "Teacher not found."}, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data
        
        try:
            if isinstance(data, list):
                return self.handle_multiple_assignments(teacher, data)
            else:
                return self.handle_single_assignment(teacher, data)
        except (ValidationError, DRFValidationError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def handle_single_assignment(self, teacher, data):
        if 'slot_id' not in data or 'day_of_week' not in data:
            raise DRFValidationError("Both 'slot_id' and 'day_of_week' are required.")
        
        slot_id = data['slot_id']
        day_of_week = data['day_of_week']
        
        try:
            slot = Slot.objects.get(pk=slot_id)
        except Slot.DoesNotExist:
            raise DRFValidationError(f"Slot with id {slot_id} does not exist.")
        
        with transaction.atomic():
            assignment = TeacherSlotAssignment(
                teacher=teacher,
                slot=slot,
                day_of_week=day_of_week
            )
            
            try:
                assignment.full_clean()
                assignment.save()
            except ValidationError as e:
                raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        
        return Response(
            {"message": "Slot assignment added successfully."},
            status=status.HTTP_201_CREATED
        )

    def handle_multiple_assignments(self, teacher, assignments_data):
        results = []
        created_count = 0
        
        with transaction.atomic():
            for assignment_data in assignments_data:
                if 'slot_id' not in assignment_data or 'day_of_week' not in assignment_data:
                    results.append({
                        "slot_id": assignment_data.get('slot_id'),
                        "day_of_week": assignment_data.get('day_of_week'),
                        "success": False,
                        "error": "Both 'slot_id' and 'day_of_week' are required."
                    })
                    continue
                
                slot_id = assignment_data['slot_id']
                day_of_week = assignment_data['day_of_week']
                
                try:
                    slot = Slot.objects.get(pk=slot_id)
                except Slot.DoesNotExist:
                    results.append({
                        "slot_id": slot_id,
                        "day_of_week": day_of_week,
                        "success": False,
                        "error": f"Slot with id {slot_id} does not exist."
                    })
                    continue
                
                try:
                    assignment = TeacherSlotAssignment(
                        teacher=teacher,
                        slot=slot,
                        day_of_week=day_of_week
                    )
                    
                    assignment.full_clean()
                    assignment.save()
                    
                    results.append({
                        "slot_id": slot_id,
                        "day_of_week": day_of_week,
                        "success": True,
                        "message": "Slot assignment added successfully."
                    })
                    created_count += 1
                except ValidationError as e:
                    results.append({
                        "slot_id": slot_id,
                        "day_of_week": day_of_week,
                        "success": False,
                        "error": e.message_dict if hasattr(e, 'message_dict') else str(e)
                    })
        
        if created_count == 0 and len(assignments_data) > 0:
            return Response(
                {"results": results, "message": "No assignments were created."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {"results": results, "message": f"Created {created_count} assignments."},
            status=status.HTTP_207_MULTI_STATUS if len(results) > 1 else status.HTTP_201_CREATED
        )
    
class TeacherSlotListView(ListAPIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherSlotAssignmentSerializer
    queryset = TeacherSlotAssignment.objects.all().select_related('slot', 'teacher')

    def get_queryset(self):
        queryset = super().get_queryset()
        teacher_id = self.kwargs.get('teacher_id')
        
        if teacher_id:
            if not Teacher.objects.filter(teacher_id=teacher_id).exists():
                raise NotFound(detail="Teacher not found")
            return queryset.filter(teacher__teacher_id=teacher_id)
        
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
    
        grouped_data = {}
        for assignment in queryset:
            day_name = dict(TeacherSlotAssignment.DAYS_OF_WEEK)[assignment.day_of_week]
            if day_name not in grouped_data:
                grouped_data[day_name] = []
            
            grouped_data[day_name].append(
                self.get_serializer(assignment).data
            )
        
        return Response({
            'count': queryset.count(),
            'results': grouped_data,
            'teacher_id': self.kwargs.get('teacher_id'),
            'message': 'Successfully retrieved slot assignments'
        })