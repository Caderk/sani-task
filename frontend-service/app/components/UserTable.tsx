// app/components/UserTable.tsx

import { User } from "../types/user";

interface UserTableProps {
  users: User[];
  onSort: (column: string) => void;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export default function UserTable({ users, onSort, onEdit, onDelete }: UserTableProps) {
  return (
    <table className="table table-hover">
      <thead className="table-light">
        <tr>
          <th scope="col" style={{ cursor: "pointer" }} onClick={() => onSort("id")}>
            ID
          </th>
          <th scope="col" style={{ cursor: "pointer" }} onClick={() => onSort("name")}>
            Name
          </th>
          <th scope="col" style={{ cursor: "pointer" }} onClick={() => onSort("rut")}>
            Rut
          </th>
          <th scope="col" style={{ cursor: "pointer" }} onClick={() => onSort("email")}>
            Email
          </th>
          <th scope="col" style={{ cursor: "pointer" }} onClick={() => onSort("birthday")}>
            Birthday
          </th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.length > 0 ? (
          users.map((user) => (
            <tr key={user.id}>
              <th scope="row">{user.id}</th>
              <td>{user.name}</td>
              <td>{user.rut}</td>
              <td>{user.email || ""}</td>
              <td>{new Date(user.birthday).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-secondary me-2"
                  onClick={() => onEdit(user)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center">
              No users found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
