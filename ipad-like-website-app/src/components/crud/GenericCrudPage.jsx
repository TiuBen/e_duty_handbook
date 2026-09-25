import { Button, Card, Table } from "@radix-ui/themes";

import { useEffect, useState } from "react";

import GenericCrudDialog from "./GenericCrudDialog";
import PageHeader from "../common/PageHeader";

const renderCell = (field, row) => {
    if (field.tableRender) {
        return field.tableRender(row);
    }

    const value = row[field.name];

    if (field.type === "date" && value) {
        return new Date(value).toLocaleDateString();
    }

    if (field.type === "datetime" && value) {
        return new Date(value).toLocaleString();
    }

    return value ?? "-";
};

export default function GenericCrudPage({ title, service, fields }) {
    const [rows, setRows] = useState([]);

    const [open, setOpen] = useState(false);

    const [editing, setEditing] = useState(null);

    const loadData = async () => {
        const res = await service.getAll();

        setRows(res.data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const createItem = () => {
        setEditing(null);
        setOpen(true);
    };

    const editItem = (item) => {
        setEditing(item);
        setOpen(true);
    };

    const deleteItem = async (id) => {
        if (!window.confirm("确定删除?")) return;

        await service.remove(id);

        loadData();
    };

    const submit = async (formData) => {
        const data = {
            ...formData,
        };

        fields.forEach((field) => {
            if (field.type === "datetime" && data[field.name]) {
                data[field.name] = new Date(data[field.name]).toISOString();
            }
        });

        if (editing) {
            await service.update(editing.id, data);
        } else {
            await service.create(data);
        }

        setOpen(false);

        loadData();
    };

    return (
        <>
            <div className="flex justify-between mb-4">
                <PageHeader />
                <Button onClick={createItem}>新增</Button>
            </div>

            <Card>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>

                            {fields.map((field) => (
                                <Table.ColumnHeaderCell key={field.name}>{field.label}</Table.ColumnHeaderCell>
                            ))}

                            <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {rows.map((row) => (
                            <Table.Row key={row.id}>
                                <Table.Cell>{row.id}</Table.Cell>

                                {/* {fields.map((field) => (
                                    <Table.Cell key={field.name}>{row[field.name]}</Table.Cell>
                                ))} */}

                                {fields.map((field) => (
                                    <Table.Cell key={field.name}>{renderCell(field, row)}</Table.Cell>
                                ))}

                                <Table.Cell>
                                    <div className="flex flex-col gap-2 text-nowrap">
                                        <Button size="1" onClick={() => editItem(row)} className="text-center flex ">
                                            编辑
                                        </Button>

                                        <Button size="1" color="red" onClick={() => deleteItem(row.id)}>
                                            删除
                                        </Button>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Card>

            <GenericCrudDialog
                open={open}
                onOpenChange={setOpen}
                title={title}
                fields={fields}
                initialData={editing}
                onSubmit={submit}
            />
        </>
    );
}
