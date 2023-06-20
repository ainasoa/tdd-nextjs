import { Role, isGranted } from "@/pages/lib/isGranted";
import UserListPage from "@/pages/components/UserListPage";

export default isGranted(Role.USER, () => <UserListPage />);
