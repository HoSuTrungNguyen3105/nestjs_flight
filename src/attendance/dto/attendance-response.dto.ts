export type AttendanceResponseDto = {
  id: number;
  employeeId: number;
  date: number;
  checkIn: number;
  checkOut: number;
  status: string;
  workedHours: number;
  note: string;
  createdAt: number;
};
