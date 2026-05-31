import GenericCrudPage from "../components/crud/GenericCrudPage";

import { userService } from "../services/userService";

export default function UserPage() {
    return (
        <GenericCrudPage
            title="用户管理"
            service={userService}
            fields={[
                {
                    name: "username",
                    label: "用户名",
                },
                {
                    name: "phonenumber",
                    label: "手机号",
                },
            ]}
        />
    );
}
