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

export default function Page() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

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

  // For searching
  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------------------------------------------------------
  // Fetch Users
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3010/api/users");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data: User[] = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  // ---------------------------------------------------------------------------
  // Handle Sorting
  // ---------------------------------------------------------------------------
  const handleSort = (key: keyof User) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return direction === "asc" ? -1 : 1;
      if (aStr > bStr) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(sortedUsers);
  };

  // ---------------------------------------------------------------------------
  // Handle Search
  // ---------------------------------------------------------------------------
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredUsers([...users]);
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
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

      const createdUser: User = await res.json();
      // Update local states
      const updatedUsers = [...users, createdUser];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

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

      const updatedUsers = users.filter((u) => u.id !== id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
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

      const updatedUser: User = await res.json();

      // Update local state
      const updatedUsers = users.map((u) =>
        u.id === updatedUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

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
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
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

      {/* Search Input */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by Name"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
      </div>

      {/* Table with Sorting */}
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
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
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

      {/* Button to show Add Form */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setShowAddForm(true)}>Add New User</button>
        {"  "}
        <button onClick={handleExportExcel}>Export to Excel</button>
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
                  value={newUser.email}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    // If user typed nothing, set email to null
                    setNewUser((prev) => ({
                      ...prev,
                      email: val === "" ? null : val
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
                    setNewUser((prev) => ({ ...prev, birthday: e.target.value }))
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
                    // If user typed nothing, set email to null
                    setEditingUser((prev) => ({
                      ...prev,
                      email: val === "" ? null : val
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
