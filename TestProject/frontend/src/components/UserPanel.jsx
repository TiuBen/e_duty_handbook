import { Card, Heading, Flex, Text, Badge } from "@radix-ui/themes";

export default function UserPanel() {
    const items = [
        {
            title: "资格检查通过",
            status: "success",
        },
        {
            title: "班前准备完成",
            status: "success",
        },
        {
            title: "等待领班确认",
            status: "pending",
        },
    ];

    return (
        <Card size="3">
            <Heading size="5" mb="5">
                我的接班状态
            </Heading>

            <Flex direction="column" gap="4">
                {items.map((item, index) => (
                    <Flex key={index} justify="between" align="center">
                        <Text size="3">{item.title}</Text>

                        <Badge color={item.status === "success" ? "green" : "orange"}>
                            {item.status === "success" ? "完成" : "处理中"}
                        </Badge>
                    </Flex>
                ))}
            </Flex>
        </Card>
    );
}
