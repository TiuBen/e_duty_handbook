import { Card, Heading, Flex, Text, Button, Badge } from "@radix-ui/themes";

export default function LeaderPanel() {
    const list = [
        {
            id: 1,
            user: "张三",
            position: "塔台A",
            status: "待确认",
        },
    ];

    return (
        <Flex direction="column" gap="4">
            {list.map((item) => (
                <Card key={item.id} size="3">
                    <Flex justify="between" align="center">
                        <Flex direction="column" gap="2">
                            <Text size="4">{item.user}</Text>

                            <Text color="gray">{item.position}</Text>
                        </Flex>

                        <Flex align="center" gap="4">
                            <Badge color="orange">{item.status}</Badge>

                            <Button>确认接班</Button>
                        </Flex>
                    </Flex>
                </Card>
            ))}
        </Flex>
    );
}
