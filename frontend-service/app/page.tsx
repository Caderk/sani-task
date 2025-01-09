// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import { User } from "./types/user";
import {
  fetchPagedUsers,
  fetchAllUsersForExport,
  createUser,
  deleteUser,
  updateUser,
} from "./services/userApi";

import UserTable from "./components/UserTable";
import PaginationControls from "./components/PaginationControls";
import AddUserModal from "./components/AddUserModal";
import EditUserModal from "./components/EditUserModal";

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sort, setSort] = useState("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    name: "",
    rut: "",
    email: "",
    birthday: "",
  });

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    handleFetchUsers(page, pageSize, sort, sortDir, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFetchUsers(
    pageVal: number,
    pageSizeVal: number,
    sortVal: string,
    sortDirVal: "asc" | "desc",
    searchVal: string
  ) {
    try {
      const data = await fetchPagedUsers(pageVal, pageSizeVal, sortVal, sortDirVal, searchVal);
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

  function handleSearch() {
    handleFetchUsers(1, pageSize, sort, sortDir, searchTerm);
  }

  function handleSortClick(newSort: string) {
    if (sort === newSort) {
      const newDir = sortDir === "asc" ? "desc" : "asc";
      setSortDir(newDir);
      handleFetchUsers(page, pageSize, newSort, newDir, searchTerm);
    } else {
      setSort(newSort);
      setSortDir("asc");
      handleFetchUsers(page, pageSize, newSort, "asc", searchTerm);
    }
  }

  function handlePrevPage() {
    if (page > 1) {
      const newPage = page - 1;
      handleFetchUsers(newPage, pageSize, sort, sortDir, searchTerm);
    }
  }

  function handleNextPage() {
    if (page < totalPages) {
      const newPage = page + 1;
      handleFetchUsers(newPage, pageSize, sort, sortDir, searchTerm);
    }
  }

  // CRUD
  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUser(newUser);
      handleFetchUsers(page, pageSize, sort, sortDir, searchTerm);
      setShowAddForm(false);
      setNewUser({ name: "", rut: "", email: "", birthday: "" });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeleteUser(id: number) {
    try {
      await deleteUser(id);
      handleFetchUsers(page, pageSize, sort, sortDir, searchTerm);
    } catch (error) {
      console.error(error);
    }
  }

  function openEditForm(user: User) {
    setEditingUser(user);
    setShowEditForm(true);
  }

  async function handleEditUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editingUser);
      handleFetchUsers(page, pageSize, sort, sortDir, searchTerm);
      setShowEditForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleExportExcel() {
    try {
      const allData = await fetchAllUsersForExport(sort, sortDir, searchTerm);
      const worksheet = XLSX.utils.json_to_sheet(allData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, "users_export.xlsx");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">User Management</h1>

      {/* Search */}
      <div className="input-group mb-3" style={{ maxWidth: "400px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-outline-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        onSort={handleSortClick}
        onEdit={openEditForm}
        onDelete={handleDeleteUser}
      />

      {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
      />

      {/* Buttons */}
      <div className="mt-3">
        <button className="btn btn-success me-2" onClick={() => setShowAddForm(true)}>
          Add New User
        </button>
        <button className="btn btn-secondary" onClick={handleExportExcel}>
          Export All Matching to Excel
        </button>
      </div>

      {/* Add Modal */}
      <AddUserModal
        show={showAddForm}
        newUser={newUser}
        onClose={() => setShowAddForm(false)}
        onChange={(field, value) => setNewUser((prev) => ({ ...prev, [field]: value }))}
        onSubmit={handleAddUser}
      />

      {/* Edit Modal */}
      <EditUserModal
        show={showEditForm}
        editingUser={editingUser}
        onClose={() => {
          setShowEditForm(false);
          setEditingUser(null);
        }}
        onChange={(field, value) =>
          setEditingUser((prev) => {
            if (!prev) return null;
            return { ...prev, [field]: value } as User;
          })
        }
        onSubmit={handleEditUserSubmit}
      />
    </div>
  );
}
