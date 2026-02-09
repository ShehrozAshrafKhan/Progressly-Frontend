
import { useUser } from '../../contexts/UserContext';
import AdminView from '../../Components/RoleBased/AdminView';
import ManagerView from '../../Components/RoleBased/ManagerView';
import UserView from '../../Components/RoleBased/UserView';

const AdminDashboard = () => {
    const { user } = useUser();
    if (!user) return <div>Loading...</div>;

  const { roles } = user;
  return (
    <div>
      {roles.includes("ADMIN") && <AdminView />}
      {roles.includes("SUPER_ADMIN") && <AdminView />}
      {roles.includes("MANAGER") && <ManagerView />}
      {roles.includes("USER") && <UserView />}
    </div>
  )
}

export default AdminDashboard