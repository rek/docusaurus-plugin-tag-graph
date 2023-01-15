import React from "react";
import { PageMetadata } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import { translate } from "@docusaurus/Translate";
import { usePluginData } from "@docusaurus/useGlobalData";
import ForceGraph2D from "react-force-graph-2d";

export default function GraphComponent({ graph }) {
  const content = usePluginData("docusaurus-plugin-content-docs");
  const version = 0;
  const ref = React.useRef();
  const handleClick = React.useCallback((node) => {
    console.log("node", node);
    document.location.href = node.id;
  });

  if (!content) {
    return <>Loading...</>;
  }

  const pageInfo = content.versions[version].docs;
  // console.log("pageInfo", pageInfo);
  // console.log("graph", graph);

  const category = graph.category;

  const title = translate({
    id: `theme.graph.${category}.title`,
    message: "Relationship Graph",
    description: `The title for the graph for the category ${category}`,
  });
  const description = translate({
    id: `theme.graph.${category}.description`,
    message: `Category: ${category}`,
    description: `The description for the graph for the category ${category}`,
  });

  const tags = new Set();
  const getTagId = (tag) => `docs/tags/${tag}`;
  const data = graph.tagMap.reduce(
    (results, node) => {
      if (node.tags.length > 0) {
        const nodeId = `docs/docs/${node.source}`;

        node.tags.forEach((tag) => {
          tags.add(tag);

          results.links.push({ source: nodeId, target: getTagId(tag) });
        });

        results.nodes.push({
          id: nodeId,
          name: node.source,
        });
      }

      return results;
    },
    {
      nodes: [],
      links: [],
    }
  );

  tags.forEach((tag) => {
    data.nodes.push({ id: getTagId(tag), name: `Tag: ${tag}` });
  });

  return (
    <>
      <PageMetadata title={title} description={description} />
      <Layout>
        <header className="hero hero--primary">
          <div className="container">
            <h1 className="hero__title">{title}</h1>
            <p className="hero__subtitle">{description}</p>
          </div>
        </header>
        <main>
          <ForceGraph2D
            ref={ref}
            onNodeClick={handleClick}
            cooldownTicks={100}
            onEngineStop={() => ref.current.zoomToFit(400)}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 16 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const backgroundDimensions = [textWidth, fontSize].map(
                (n) => n + fontSize * 0.5
              ); // some padding

              ctx.fillStyle = graph.colours.background;
              ctx.fillRect(
                node.x - backgroundDimensions[0] / 2,
                node.y - backgroundDimensions[1] / 2,
                ...backgroundDimensions
              );

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = graph.colours.text;
              ctx.fillText(label, node.x, node.y);

              node.__backgroundDimensions = backgroundDimensions; // to re-use in nodePointerAreaPaint
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              const backgroundDimensions = node.__backgroundDimensions;
              backgroundDimensions &&
                ctx.fillRect(
                  node.x - backgroundDimensions[0] / 2,
                  node.y - backgroundDimensions[1] / 2,
                  ...backgroundDimensions
                );
            }}
            graphData={data}
          />
        </main>
      </Layout>
    </>
  );
}
