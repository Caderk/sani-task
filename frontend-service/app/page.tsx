"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface User {
  id: number;
  name: string;
  rut: string;
  email?: string;
  birthday: string;
}

// Shape of server response from GET /api/users
interface PagedResult {
  page: number;
  pageSize: number;
  sort: string;
  sortDir: string;
  totalCount: number;
  totalPages: number;
  data: User[];
}

export default function Page() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  // Users retrieved from server
  const [users, setUsers] = useState<User[]>([]);

  // Pagination & Sorting State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [sort, setSort] = useState<string>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [totalPages, setTotalPages] = useState<number>(1);

  // For the add user form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    name: "",
    rut: "",
    email: "",
    birthday: "",
  });

  // For the edit user form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch Users from Server
  // ---------------------------------------------------------------------------
  async function fetchUsers(
    pageVal: number,
    pageSizeVal: number,
    sortVal: string,
    sortDirVal: "asc" | "desc"
  ) {
    try {
      // Build query string with pagination & sorting
      const url = `http://localhost:3010/api/users?page=${pageVal}&pageSize=${pageSizeVal}&sort=${sortVal}&sortDir=${sortDirVal}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data: PagedResult = await res.json();
      // Update local states
      setUsers(data.data);
      setPage(data.page);
      setPageSize(data.pageSize);
      setSort(data.sort);
      setSortDir(data.sortDir as "asc" | "desc");
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    }
  }

  // Run on first load
  useEffect(() => {
    fetchUsers(page, pageSize, sort, sortDir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Handle Sorting (Server-Side)
  // ---------------------------------------------------------------------------
  const handleSort = (newSort: string) => {
    // If user clicks the same column, flip direction
    if (sort === newSort) {
      const newDir = sortDir === "asc" ? "desc" : "asc";
      setSortDir(newDir);
      fetchUsers(page, pageSize, newSort, newDir);
    } else {
      // Otherwise, set new column with default asc
      setSort(newSort);
      setSortDir("asc");
      fetchUsers(page, pageSize, newSort, "asc");
    }
  };

  // ---------------------------------------------------------------------------
  // Pagination Controls
  // ---------------------------------------------------------------------------
  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchUsers(newPage, pageSize, sort, sortDir);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchUsers(newPage, pageSize, sort, sortDir);
    }
  };

  // If you want a direct "Go to page X" approach, you can add an input or
  // numeric pager. But for simplicity, we use Prev/Next here.

  // ---------------------------------------------------------------------------
  // Handle Add User
  // ---------------------------------------------------------------------------
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3010/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        throw new Error("Failed to add user");
      }

      // The server returns the newly created user
      const createdUser: User = await res.json();
      // After adding, we should re-fetch the current page to see the updated list
      // (Though if the new user is on a new page, you might not see it right away.)
      fetchUsers(page, pageSize, sort, sortDir);

      // Reset form
      setNewUser({ name: "", rut: "", email: "", birthday: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------------------------------------------------------
  // Handle Delete User
  // ---------------------------------------------------------------------------
  const handleDeleteUser = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3010/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      // Re-fetch the current page data after deletion
      fetchUsers(page, pageSize, sort, sortDir);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------------------------------------------------------
  // Open Edit Form
  // ---------------------------------------------------------------------------
  const openEditForm = (user: User) => {
    setEditingUser(user);
    setShowEditForm(true);
  };

  // ---------------------------------------------------------------------------
  // Handle Edit User (PUT)
  // ---------------------------------------------------------------------------
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`http://localhost:3010/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      // The server returns the updated user
      const updatedUser: User = await res.json();

      // Re-fetch the current page to see updated results
      fetchUsers(page, pageSize, sort, sortDir);

      // Close form
      setShowEditForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------------------------------------------------------
  // Handle Export to Excel
  // ---------------------------------------------------------------------------
  const handleExportExcel = () => {
    // We currently have only the single page of `users` in memory.
    // This will export just this page.
    // If you want *all* users, you'd need a separate endpoint or approach.
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_export.xlsx");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div style={{ padding: "1rem" }}>
      <h1>User Management</h1>

      {/* Table with Server-Side Sorting */}
      <table border={1} cellPadding={8} cellSpacing={0} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>ID</th>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("rut")}>Rut</th>
            <th onClick={() => handleSort("email")}>Email</th>
            <th onClick={() => handleSort("birthday")}>Birthday</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.rut}</td>
                <td>{user.email || ""}</td>
                <td>
                  {new Date(user.birthday).toLocaleDateString()}
                </td>
                <td>
                  <button onClick={() => openEditForm(user)}>Edit</button>{" "}
                  <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ marginTop: "1rem" }}>
        <button disabled={page <= 1} onClick={handlePrevPage}>
          Prev
        </button>{" "}
        <span style={{ margin: "0 1rem" }}>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={handleNextPage}>
          Next
        </button>
      </div>

      {/* Buttons to show Add Form & Export */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setShowAddForm(true)}>Add New User</button>
        {"  "}
        <button onClick={handleExportExcel}>Export Current Page to Excel</button>
      </div>

      {/* Add New User Form (Modal) */}
      {showAddForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setShowAddForm(false)}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              minWidth: "300px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Add User</h2>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: "0.5rem" }}>
                <label>Name: </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Rut: </label>
                <input
                  type="text"
                  required
                  value={newUser.rut}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, rut: e.target.value }))
                  }
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Email: </label>
                <input
                  type="email"
                  value={newUser.email || ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setNewUser((prev) => ({
                      ...prev,
                      email: val === "" ? null : val,
                    }));
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Birthday: </label>
                <input
                  type="date"
                  required
                  value={newUser.birthday}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      birthday: e.target.value,
                    }))
                  }
                />
              </div>

              <button type="submit" style={{ marginRight: "0.5rem" }}>
                Save
              </button>
              <button type="button" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Form (Modal) */}
      {showEditForm && editingUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setShowEditForm(false)}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              minWidth: "300px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit User</h2>
            <form onSubmit={handleEditUserSubmit}>
              <div style={{ marginBottom: "0.5rem" }}>
                <label>Name: </label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Rut: </label>
                <input
                  type="text"
                  required
                  value={editingUser.rut}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, rut: e.target.value })
                  }
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Email: </label>
                <input
                  type="email"
                  value={editingUser.email ?? ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setEditingUser((prev) => ({
                      ...prev,
                      email: val === "" ? null : val,
                    }));
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Birthday: </label>
                <input
                  type="date"
                  required
                  value={
                    editingUser.birthday
                      ? new Date(editingUser.birthday).toISOString().slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, birthday: e.target.value })
                  }
                />
              </div>

              <button type="submit" style={{ marginRight: "0.5rem" }}>
                Update
              </button>
              <button type="button" onClick={() => setShowEditForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
