import GenericCrudPage from "../components/crud/GenericCrudPage";

import { infoService } from "../services/infoService";
import { sourceService } from "../services/sourceService";
import { userService } from "../services/userService";
import { positionService } from "../services/positionService";

export default function InfoPage() {
    return (
        <GenericCrudPage
            title="信息管理"
            service={infoService}
            fields={[
                {
                    name: "description",
                    label: "具体信息内容",
                    type: "text",
                },
                {
                    name: "startTime",
                    label: "开始时间",
                    type: "datetime",
                },
                {
                    name: "endTime",
                    label: "结束时间",
                    type: "datetime",
                },
                {
                    name: "validRule",
                    label: "NOTAM生效规则",
                    type: "textarea",
                },
                {
                    name: "sourceId",
                    label: "消息来源",

                    type: "select",

                    service: sourceService,

                    valueField: "id",

                    labelField: "name",

                    tableRender: (row) => row.infoSource?.name,
                },
                {
                    name: "creatorUserId",
                    label: "处理人",

                    type: "select",

                    service: userService,

                    valueField: "id",

                    labelField: "username",

                    tableRender: (row) => row.creatorUser?.username,
                },
                {
                    name: "creatorPositionId",
                    label: "处理席位",

                    type: "select",

                    service: positionService,

                    valueField: "id",

                    labelField: "title",

                    tableRender: (row) => row.creatorPosition?.title,
                },
            ]}
        />
    );
}
