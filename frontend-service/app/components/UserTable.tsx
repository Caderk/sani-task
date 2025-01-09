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
    <table border={1} cellPadding={8} cellSpacing={0} style={{ width: "100%" }}>
      <thead>
        <tr>
          <th onClick={() => onSort("id")}>ID</th>
          <th onClick={() => onSort("name")}>Name</th>
          <th onClick={() => onSort("rut")}>Rut</th>
          <th onClick={() => onSort("email")}>Email</th>
          <th onClick={() => onSort("birthday")}>Birthday</th>
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
              <td>{new Date(user.birthday).toLocaleDateString()}</td>
              <td>
                <button onClick={() => onEdit(user)}>Edit</button>{" "}
                <button onClick={() => onDelete(user.id)}>Delete</button>
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
  );
}
