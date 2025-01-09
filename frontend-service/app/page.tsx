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
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [sort, setSort] = useState<string>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [totalPages, setTotalPages] = useState<number>(1);

  // For searching
  const [searchTerm, setSearchTerm] = useState<string>("");

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
  // Fetch Users from the server with pagination, sorting, and search
  // ---------------------------------------------------------------------------
  const fetchUsers = async (
    pageVal: number,
    pageSizeVal: number,
    sortVal: string,
    sortDirVal: "asc" | "desc",
    searchVal: string
  ) => {
    try {
      // Build query string
      const url = new URL("http://localhost:3010/api/users");
      url.searchParams.append("page", String(pageVal));
      url.searchParams.append("pageSize", String(pageSizeVal));
      url.searchParams.append("sort", sortVal);
      url.searchParams.append("sortDir", sortDirVal);
      if (searchVal.trim()) {
        url.searchParams.append("search", searchVal.trim());
      }

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: PagedResult = await res.json();
      setUsers(data.data);
      setPage(data.page);
      setPageSize(data.pageSize);
      setSort(data.sort);
      setSortDir(data.sortDir as "asc" | "desc");
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers(page, pageSize, sort, sortDir, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Search Handler (Server-Side)
  // ---------------------------------------------------------------------------
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Reset to first page whenever we do a new search
    const newPage = 1;
    setPage(newPage);
    fetchUsers(newPage, pageSize, sort, sortDir, term);
  };

  // ---------------------------------------------------------------------------
  // Sorting (Server-Side)
  // ---------------------------------------------------------------------------
  const handleSort = (newSort: string) => {
    if (sort === newSort) {
      const newDir = sortDir === "asc" ? "desc" : "asc";
      setSortDir(newDir);
      fetchUsers(page, pageSize, newSort, newDir, searchTerm);
    } else {
      setSort(newSort);
      setSortDir("asc");
      fetchUsers(page, pageSize, newSort, "asc", searchTerm);
    }
  };

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------
  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchUsers(newPage, pageSize, sort, sortDir, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchUsers(newPage, pageSize, sort, sortDir, searchTerm);
    }
  };

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

      // Refetch the current page of results
      await fetchUsers(page, pageSize, sort, sortDir, searchTerm);

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

      // Refetch the current page
      fetchUsers(page, pageSize, sort, sortDir, searchTerm);
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

      // Refetch the current page
      await fetchUsers(page, pageSize, sort, sortDir, searchTerm);

      setShowEditForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------------------------------------------------------
  // Export to Excel (All Matching Current Search)
  // ---------------------------------------------------------------------------
  const handleExportExcel = async () => {
    try {
      // We'll fetch *all* matching rows (no pagination) for the *current* search
      const url = new URL("http://localhost:3010/api/users");
      // page=1, a large pageSize, same sort, sortDir, and searchTerm
      url.searchParams.append("page", "1");
      url.searchParams.append("pageSize", "999999");  // some large number
      url.searchParams.append("sort", sort);
      url.searchParams.append("sortDir", sortDir);
      if (searchTerm.trim()) {
        url.searchParams.append("search", searchTerm.trim());
      }

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to fetch all matching users for export");
      }
      const data: PagedResult = await res.json();

      // data.data now has all rows that match the current search
      const worksheet = XLSX.utils.json_to_sheet(data.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, "users_export.xlsx");
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div style={{ padding: "1rem" }}>
      <h1>User Management</h1>

      {/* Search Input */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by Name or Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <button
          onClick={() => handleSearch(searchTerm)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            marginLeft: "0.5rem",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* Table */}
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
          {users && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.rut}</td>
                <td>{user.email || ""}</td>
                <td>{new Date(user.birthday).toLocaleDateString()}</td>
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
        </button>
        <span style={{ margin: "0 1rem" }}>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={handleNextPage}>
          Next
        </button>
      </div>

      {/* Buttons */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setShowAddForm(true)}>Add New User</button>
        {"  "}
        <button onClick={handleExportExcel}>Export All Matching to Excel</button>
      </div>

      {/* Add User Modal */}
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

      {/* Edit User Modal */}
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
                  onChange={(ev) =>
                    setEditingUser({ ...editingUser, name: ev.target.value })
                  }
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Rut: </label>
                <input
                  type="text"
                  required
                  value={editingUser.rut}
                  onChange={(ev) =>
                    setEditingUser({ ...editingUser, rut: ev.target.value })
                  }
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Email: </label>
                <input
                  type="email"
                  value={editingUser.email ?? ""}
                  onChange={(ev) => {
                    const val = ev.target.value.trim();
                    setEditingUser((prev) => ({
                      ...prev!,
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
                  onChange={(ev) =>
                    setEditingUser({ ...editingUser, birthday: ev.target.value })
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
