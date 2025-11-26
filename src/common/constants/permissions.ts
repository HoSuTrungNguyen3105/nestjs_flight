export const Permission = {
  FLIGHT: {
    VIEW: 'FLIGHT_VIEW',
    CREATE: 'FLIGHT_CREATE',
    EDIT: 'FLIGHT_EDIT',
    DELETE: 'FLIGHT_DELETE',
  },
  PASSENGER: {
    VIEW: 'PASSENGER_VIEW',
    EDIT: 'PASSENGER_EDIT',
    DELETE: 'PASSENGER_DELETE',
  },
  BOOKING: {
    VIEW: 'BOOKING_VIEW',
    EDIT: 'BOOKING_EDIT',
    DELETE: 'BOOKING_DELETE',
  },
  AIRCRAFT: {
    VIEW: 'AIRCRAFT_VIEW',
    CREATE: 'AIRCRAFT_CREATE',
    EDIT: 'AIRCRAFT_EDIT',
    DELETE: 'AIRCRAFT_DELETE',
  },
  AIRPORT: {
    VIEW: 'AIRPORT_VIEW',
    CREATE: 'AIRPORT_CREATE',
    EDIT: 'AIRPORT_EDIT',
    DELETE: 'AIRPORT_DELETE',
  },
  USER: {
    VIEW: 'USER_VIEW',
    CREATE: 'USER_CREATE',
    EDIT: 'USER_EDIT',
    DELETE: 'USER_DELETE',
  },
} as const;

export const ADMIN_PERMISSIONS = Object.values(Permission).flatMap((group) =>
  Object.values(group),
);

export const MONITOR_PERMISSIONS = Object.values(Permission).flatMap((group) =>
  Object.values(group).filter((p) => p.endsWith('_VIEW')),
);
