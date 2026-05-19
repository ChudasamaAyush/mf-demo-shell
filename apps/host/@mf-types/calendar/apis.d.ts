
    export type RemoteKeys = 'calendar/Calendar';
    type PackageType<T> = T extends 'calendar/Calendar' ? typeof import('calendar/Calendar') :any;