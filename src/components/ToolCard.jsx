import { ArrowUpRight } from "lucide-react";

function ToolCard({ tool }) {
  const Icon = tool.icon;

  return (
    <a href={tool.path} className="tool-card">
      <div className="tool-icon">
        <Icon size={24} />
      </div>

      <div className="tool-card-content">
        <h3>{tool.name}</h3>

        <p>{tool.description}</p>

        <span className="tool-category">
          {tool.category}
        </span>
      </div>

      <ArrowUpRight
        className="tool-arrow"
        size={19}
      />
    </a>
  );
}

export default ToolCard;