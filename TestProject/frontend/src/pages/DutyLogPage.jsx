import GenericCrudPage from "../components/crud/GenericCrudPage";

import { dutyLogService } from "../services/dutyLogService";
import { userService } from "../services/userService";
export default function DutyLogPage() {
    return (
        <GenericCrudPage
            title="值班日志"
            service={dutyLogService}
            fields={[
                {
                    name: "logDate",
                    label: "值班时间",
                    type: "datetime",
                },

                {
                    name: "userId",
                    label: "值班员",

                    type: "select",

                    service: userService,

                    valueField: "id",

                    labelField: "username",

                    tableRender: (row) => row.user?.username,
                },
            ]}
        />
    );
}
