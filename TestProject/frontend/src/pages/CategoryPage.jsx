import GenericCrudPage from "../components/crud/GenericCrudPage";

import { categoriesService } from "../services/categoryService";
export default function CategoryPage() {
    return (
        <GenericCrudPage
            title="值班日志"
            service={categoriesService}
            fields={[
                {
                    name: "name",
                    label: "分类名称",
                    type: "text",
                },
            ]}
        />
    );
}
