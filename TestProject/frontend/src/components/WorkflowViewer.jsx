import { useEffect, useRef } from "react";

import BpmnViewer from "bpmn-js";

import { getWorkflowXml } from "../api/workflow.api";
import { Card } from "@radix-ui/themes";

export default function WorkflowViewer() {
    const containerRef = useRef(null);

    const viewerRef = useRef(null);

    useEffect(() => {
        viewerRef.current = new BpmnViewer({
            container: containerRef.current,
        });

        async function loadDiagram() {
            const xml = await getWorkflowXml();

            await viewerRef.current.importXML(xml);

            viewerRef.current.get("canvas").zoom("fit-viewport");

            highlightNodes();
        }

        loadDiagram();

        return () => {
            viewerRef.current.destroy();
        };
    }, []);

    function highlightNodes() {
        const canvas = viewerRef.current.get("canvas");

        // 模拟流程状态

        canvas.addMarker("checkQualification", "highlight-green");

        canvas.addMarker("checkPreparation", "highlight-yellow");
    }

    return (
        <Card size="3">
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "700px",
                }}
            />
        </Card>
    );
}
