import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface Room {
  id: number;
  room_number: string;
  block: string;
  description: string;
  maintained_by: number;
  is_lab: boolean;
  room_type: string;
  room_min_cap: number;
  room_max_cap: number;
  has_projector: boolean;
  has_ac: boolean;
  tech_level: string;
}

export interface CreateRoomRequest {
  room_number: string;
  block: string;
  description: string;
  maintained_by: number;
  is_lab: boolean;
  room_type: string;
  room_min_cap: number;
  room_max_cap: number;
  has_projector: boolean;
  has_ac: boolean;
  tech_level: string;
}

export type UpdateRoomRequest = Partial<CreateRoomRequest>;

// Get all rooms
export const useGetRooms = (roomType?: string) => {
  return useQueryData(
    ['rooms'],
    async () => {
      try {
        const response = await api.get('/api/rooms/', {
          params: {
            roomType : roomType
          }
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch rooms');
        }
        throw error;
      }
    }
  );
};

// Get a single room by ID
export const useGetRoom = (id: number, roomType? : string) => {
  return useQueryData(
    ['room', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/rooms/${id}/`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch room');
        }
        throw error;
      }
    }
  );
};

// Create a new room
export const useCreateRoom = (onSuccess?: () => void) => {
  return useMutationData(
    ['createRoom'],
    async (data: CreateRoomRequest) => {
      try {
        const response = await api.post('/api/rooms/', data);
        return {
          status: response.status,
          data: response.data.message || 'Room created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create room',
          };
        }
        throw error;
      }
    },
    'rooms',
    onSuccess
  );
};

// Update an existing room
export const useUpdateRoom = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateRoom', id.toString()],
    async (data: UpdateRoomRequest) => {
      try {
        const response = await api.put(`/api/rooms/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Room updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update room',
          };
        }
        throw error;
      }
    },
    [['rooms'], ['room', id.toString()]],
    onSuccess
  );
};

// Delete a room
export const useDeleteRoom = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteRoom', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/rooms/${id}/`);
        return {
          status: response.status,
          data: response.data.message || 'Room deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete room',
          };
        }
        throw error;
      }
    },
    'rooms',
    onSuccess
  );
}; 