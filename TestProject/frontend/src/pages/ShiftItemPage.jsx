import { shiftItemService } from "../services/shiftItemService";
import GenericCrudPage from "../components/crud/GenericCrudPage";

export default function ShiftItemPage() {
    return (
        <GenericCrudPage
            title="值班项管理"
            service={shiftItemService}
            fields={[
                {
                    name: "shiftDate",
                    label: "值班日期",
                    type: "date",
                },
            ]}
        />
    );
}
