import { Button, Dialog, Flex, TextField } from "@radix-ui/themes";

import { useEffect, useState } from "react";

export default function GenericCrudDialog({ open, onOpenChange, title, fields, initialData, onSubmit }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const data = {};

        fields.forEach((f) => {
            data[f.name] = initialData?.[f.name] ?? "";
        });

        setFormData(data);
    }, [fields, initialData]);

    const updateField = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="500px">
                <Dialog.Title>{title}</Dialog.Title>

                <Flex direction="column" gap="3" mt="4">
                    {fields.map((field) => (
                        <TextField.Root
                            key={field.name}
                            placeholder={field.label}
                            value={formData[field.name] || ""}
                            onChange={(e) => updateField(field.name, e.target.value)}
                        />
                    ))}
                </Flex>

                <Flex justify="end" gap="3" mt="5">
                    <Button color="gray" variant="soft" onClick={() => onOpenChange(false)}>
                        取消
                    </Button>

                    <Button onClick={() => onSubmit(formData)}>保存</Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
