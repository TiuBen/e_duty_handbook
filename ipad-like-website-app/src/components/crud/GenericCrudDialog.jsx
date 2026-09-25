import { Button, Dialog, Flex, TextField, TextArea, Select } from "@radix-ui/themes";

import { useEffect, useState } from "react";

export default function GenericCrudDialog({ open, onOpenChange, title, fields, initialData, onSubmit }) {
    const [formData, setFormData] = useState({});

    const [options, setOptions] = useState({});

    useEffect(() => {
        const data = {};

        fields.forEach((field) => {
            data[field.name] = initialData?.[field.name] ?? "";
        });

        setFormData(data);
    }, [fields, initialData]);

    useEffect(() => {
        const loadOptions = async () => {
            const result = {};

            for (const field of fields) {
                if (field.type === "select" && field.service) {
                    const res = await field.service.getAll();

                    result[field.name] = res.data;
                }
            }

            setOptions(result);
        };

        loadOptions();
    }, [fields]);

    const updateField = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const renderField = (field) => {
        switch (field.type) {
            case "textarea":
                return (
                    <TextArea
                        value={formData[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                    />
                );

            case "date":
                return (
                    <input
                        type="date"
                        className="border rounded p-2"
                        value={formData[field.name] ? String(formData[field.name]).slice(0, 10) : ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                    />
                );

            case "datetime":
                return (
                    <input
                        type="datetime-local"
                        className="border rounded p-2"
                        value={formData[field.name] ? String(formData[field.name]).slice(0, 16) : ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                    />
                );

            case "select":
                return (
                    <Select.Root
                        value={String(formData[field.name] || "")}
                        onValueChange={(value) => updateField(field.name, Number(value))}
                    >
                        <Select.Trigger />

                        <Select.Content>
                            {(options[field.name] || []).map((item) => (
                                <Select.Item key={item[field.valueField]} value={String(item[field.valueField])}>
                                    {item[field.labelField]}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                );

            default:
                return (
                    <TextField.Root
                        value={formData[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                    />
                );
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content>
                <Dialog.Title>{title}</Dialog.Title>

                <Flex direction="column" gap="3" mt="4">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label className="block mb-1">{field.label}</label>

                            {renderField(field)}
                        </div>
                    ))}
                </Flex>

                <Flex justify="end" gap="3" mt="5">
                    <Button variant="soft" color="gray" onClick={() => onOpenChange(false)}>
                        取消
                    </Button>

                    <Button onClick={() => onSubmit(formData)}>保存</Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
