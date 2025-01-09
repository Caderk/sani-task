// app/services/userApi.ts

import { User, PagedResult } from "../types/user";

/** Fetch a paged list of users from server with optional search, sorting, and pagination. */
export async function fetchPagedUsers(
  page: number,
  pageSize: number,
  sort: string,
  sortDir: "asc" | "desc",
  search: string
): Promise<PagedResult> {
  const url = new URL("http://localhost:3010/api/users");
  url.searchParams.append("page", String(page));
  url.searchParams.append("pageSize", String(pageSize));
  url.searchParams.append("sort", sort);
  url.searchParams.append("sortDir", sortDir);
  if (search.trim()) {
    url.searchParams.append("search", search.trim());
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch paged users");
  }
  return res.json();
}

/** Fetch all matching rows (for export), ignoring pagination limit. */
export async function fetchAllUsersForExport(
  sort: string,
  sortDir: "asc" | "desc",
  search: string
): Promise<User[]> {
  const url = new URL("http://localhost:3010/api/users");
  url.searchParams.append("page", "1");
  url.searchParams.append("pageSize", "999999"); // large page size
  url.searchParams.append("sort", sort);
  url.searchParams.append("sortDir", sortDir);
  if (search.trim()) {
    url.searchParams.append("search", search.trim());
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch users for export");
  }
  const data: PagedResult = await res.json();
  return data.data;
}

/** Create a new user. Returns the created user. */
export async function createUser(userData: Omit<User, "id">): Promise<User> {
  const res = await fetch("http://localhost:3010/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    throw new Error("Failed to create user");
  }
  return res.json();
}

/** Delete a user by ID. */
export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`http://localhost:3010/api/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete user");
  }
}

/** Update (PUT) an existing user. Returns the updated user. */
export async function updateUser(id: number, userData: User): Promise<User> {
  const res = await fetch(`http://localhost:3010/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    throw new Error("Failed to update user");
  }
  return res.json();
}
