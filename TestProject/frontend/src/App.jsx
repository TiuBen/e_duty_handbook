import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { Tabs, Container, Box } from "@radix-ui/themes";
import WorkflowViewer from "./components/WorkflowViewer";

import UserPanel from "./components/UserPanel";

import LeaderPanel from "./components/LeaderPanel";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UsersPage from "./pages/UsersPage";

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/users" element={<UsersPage />} />
                <Route
                    path="/test"
                    element={
                        <Container
                            size="4"
                            style={{
                                paddingTop: 20,
                            }}
                        >
                            <Tabs.Root defaultValue="workflow">
                                <Tabs.List>
                                    <Tabs.Trigger value="workflow">流程图</Tabs.Trigger>

                                    <Tabs.Trigger value="user">普通用户</Tabs.Trigger>

                                    <Tabs.Trigger value="leader">领班视角</Tabs.Trigger>
                                </Tabs.List>

                                <Box pt="4">
                                    <Tabs.Content value="workflow">
                                        <WorkflowViewer />
                                    </Tabs.Content>

                                    <Tabs.Content value="user">
                                        <UserPanel />
                                    </Tabs.Content>

                                    <Tabs.Content value="leader">
                                        <LeaderPanel />
                                    </Tabs.Content>
                                </Box>
                            </Tabs.Root>
                        </Container>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
