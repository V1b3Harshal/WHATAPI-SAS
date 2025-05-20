// app/admin/users/page.tsx
import { UserTable } from "@/components/admin/users-table";
import { OnlineUsersWidget } from "@/components/admin/online-users-widget";
import { SearchUsers } from "@/components/admin/search-users";

export default function UsersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex space-x-4">
          <OnlineUsersWidget />
          <SearchUsers />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <UserTable />
      </div>
    </div>
  );
}