import GenericCrudPage from "../components/crud/GenericCrudPage";

import { positionService } from "../services/positionService";

export default function PositionPage() {
    return (
        <GenericCrudPage
            title="岗位管理"
            service={positionService}
            fields={[
                {
                    name: "title",
                    label: "岗位名称",
                    type: "text",
                },
            ]}
        />
    );
}
