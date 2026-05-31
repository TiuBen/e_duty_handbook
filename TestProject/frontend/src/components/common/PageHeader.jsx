import { Flex, Heading } from "@radix-ui/themes";

export default function PageHeader({ title, children }) {
    return (
        <Flex justify="between" align="center" mb="4">
            <Heading size="6">{title}</Heading>

            {children}
        </Flex>
    );
}
