import { Flex, Heading, Text } from "@radix-ui/themes";
import { useLocation } from "react-router-dom";
import menus from "../../api/navMenus";
export default function PageHeader() {
    const location = useLocation();

    // 根据当前路径匹配菜单项
    const currentMenu = menus.find((menu) => location.pathname.startsWith(menu.path));

    const title = currentMenu?.title;
    const subTitle = currentMenu?.subTitle;

    return (
        <Flex justify="start" align="end" mb="4" gap="4">
            <Heading size="6">{title}</Heading>
            {subTitle && (
                <Text size="3" mt="1" className="font-bold text-blue-500">
                    {subTitle}
                </Text>
            )}
        </Flex>
    );
}
