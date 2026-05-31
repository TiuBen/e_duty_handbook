import GenericCrudPage from "../components/crud/GenericCrudPage";

import { sourceService } from "../services/sourceService";

export default function SourcePage() {
    return (
        <GenericCrudPage
            title="来源管理"
            service={sourceService}
            fields={[
                {
                    name: "name",
                    label: "来源名称",
                    type: "text",
                },
            ]}
        />
    );
}
