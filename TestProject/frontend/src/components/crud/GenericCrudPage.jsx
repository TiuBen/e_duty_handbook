import { Button, Card, Table } from "@radix-ui/themes";

import { useEffect, useState } from "react";

import GenericCrudDialog from "./GenericCrudDialog";

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
        if (editing) {
            await service.update(editing.id, formData);
        } else {
            await service.create(formData);
        }

        setOpen(false);

        loadData();
    };

    return (
        <>
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">{title}</h1>

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

                                {fields.map((field) => (
                                    <Table.Cell key={field.name}>{row[field.name]}</Table.Cell>
                                ))}

                                <Table.Cell>
                                    <div className="flex gap-2">
                                        <Button size="1" onClick={() => editItem(row)}>
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
