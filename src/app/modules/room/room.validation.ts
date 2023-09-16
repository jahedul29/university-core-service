import { z } from 'zod';

const createValidation = z.object({
  body: z.object({
    roomNumber: z
      .string({
        required_error: 'RoomNumber is required',
      })
      .trim()
      .min(1, { message: 'RoomNumber is required' }),
    floor: z
      .string({
        required_error: 'Floor is required',
      })
      .trim()
      .min(1, { message: 'Floor is required' }),
    buildingId: z
      .string({
        required_error: 'BuildingId is required',
      })
      .trim()
      .min(1, { message: 'BuildingId is required' }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    roomNumber: z.string().trim().optional(),
    floor: z.string().trim().optional(),
    buildingId: z.string().trim().optional(),
  }),
});

export const RoomValidation = {
  createValidation,
  updateValidation,
};
