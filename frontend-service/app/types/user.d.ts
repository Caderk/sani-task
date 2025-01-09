// app/types/user.d.ts (or .ts)
export interface User {
    id: number;
    name: string;
    rut: string;
    email?: string;
    birthday: string;
  }
  
  export interface PagedResult {
    page: number;
    pageSize: number;
    sort: string;
    sortDir: string;
    totalCount: number;
    totalPages: number;
    data: User[];
  }
  