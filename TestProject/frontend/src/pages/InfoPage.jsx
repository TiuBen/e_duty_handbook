import GenericCrudPage from "../components/crud/GenericCrudPage";

import { infoService } from "../services/infoService";

export default function InfoPage() {
    return (
        <GenericCrudPage
            title="信息管理"
            service={infoService}
            fields={[
                {
                    name: "description",
                    label: "描述",
                    type: "text",
                },
            ]}
        />
    );
}
