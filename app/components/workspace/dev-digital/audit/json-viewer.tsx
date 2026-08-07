"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { KBD } from "@/app/components/workspace/dev-digital/ui/primitives";

type JsonNodeProps = {
  value: unknown;
  path: string;
  depth: number;
  rootExpanded: boolean;
};

const COLORS = {
  key: "#7dd3fc",
  string: "#3ddc97",
  number: "#f5b84d",
  boolean: "#a78bfa",
  null: "#f58ea8",
  punct: "#5c6889",
};

function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return value !== null && typeof value === "object";
}

function ContainerSummary({ value }: { value: Record<string, unknown> | unknown[] }) {
  const size = Array.isArray(value) ? value.length : Object.keys(value).length;
  return Array.isArray(value)
    ? size === 0
      ? "[]"
      : `${size} éléments`
    : size === 0
      ? "{}"
      : `${size} clés`;
}

function JsonNode({ value, path, depth, rootExpanded }: JsonNodeProps) {
  const [open, setOpen] = useState(rootExpanded && depth < 2);
  const indent = { paddingLeft: depth * 14 };

  if (!isContainer(value)) {
    const rendered = renderPrimitive(value);
    return (
      <div className="flex flex-wrap items-baseline gap-1 py-0.5 text-[11px] leading-5 font-mono" style={indent}>
        {path.includes(".") ? (
          <>
            <span style={{ color: COLORS.key }}>{path.split(".").slice(-1)[0]}</span>
            <span style={{ color: COLORS.punct }}>:</span>
          </>
        ) : null}
        {rendered}
        <CopyPath path={path} />
      </div>
    );
  }

  const entries = Object.entries(value) as [string, unknown][];
  const summary = <ContainerSummary value={value} />;

  return (
    <div className="font-mono text-[11px] leading-5">
      <div className="flex items-center gap-1.5 py-0.5" style={indent}>
        <button
          aria-expanded={open}
          className="grid size-4 place-items-center rounded text-[#5c6889] transition hover:text-[#c3cbdf]"
          onClick={() => setOpen((previous) => !previous)}
          type="button"
        >
          <Icon className="transition-transform duration-200" name="chevron-down" size={10} style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }} />
        </button>
        {Array.isArray(value) ? (
          <span style={{ color: COLORS.punct }}>{`[${open ? "" : summary}]`}</span>
        ) : (
          <span style={{ color: COLORS.punct }}>{`{${open ? "" : summary}}`}</span>
        )}
        <span className="text-[9px] font-bold" style={{ color: COLORS.punct }}>
          {Array.isArray(value) ? `array·${value.length}` : `object·${entries.length}`}
        </span>
        <CopyPath path={path} />
      </div>
      {open ? (
        <div>
          {entries.map(([key, child]) => (
            <JsonNode
              depth={depth + 1}
              key={key}
              path={path ? `${path}.${key}` : key}
              rootExpanded={rootExpanded}
              value={child}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function renderPrimitive(value: unknown) {
  if (value === null) return <span style={{ color: COLORS.null }}>null</span>;
  switch (typeof value) {
    case "string":
      return (
        <span style={{ color: COLORS.string }}>
          &quot;{value}&quot;
        </span>
      );
    case "number":
      return <span style={{ color: COLORS.number }}>{String(value)}</span>;
    case "boolean":
      return <span style={{ color: COLORS.boolean }}>{String(value)}</span>;
    default:
      return <span style={{ color: COLORS.punct }}>{String(value)}</span>;
  }
}

function CopyPath({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      aria-label={`Copier le chemin ${path}`}
      className="ml-1 grid size-4 place-items-center rounded text-[#3a4464] opacity-0 transition hover:bg-white/[0.06] hover:text-[#7dd3fc] focus:opacity-100 group-hover:opacity-100"
      onClick={() => {
        navigator.clipboard?.writeText(path || "(racine)");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      title="Copier le chemin"
      type="button"
    >
      <Icon name={copied ? "check" : "copy"} size={9} />
    </button>
  );
}

export function JsonViewer({
  value,
  title,
  pathLabel = "valeur_apres",
}: {
  value: unknown;
  title: string;
  pathLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isEmpty = value === null || value === undefined || (typeof value === "object" && Object.keys(value).length === 0);

  return (
    <div className="group">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-2.5">
        <p className="flex items-center gap-2 font-mono text-[9px] font-black tracking-[0.2em] text-[#6b7994]">
          {title}
          <span className="font-mono text-[9px] font-bold text-[#3a4464]">{isEmpty ? "— vide" : pathLabel}</span>
        </p>
        {!isEmpty ? (
          <button
            className="rounded-md border border-white/[0.08] px-2 py-0.5 font-mono text-[9px] font-bold text-[#8b96b3] transition hover:border-[#5cc8ff]/40 hover:text-[#7dd3fc]"
            onClick={() => setExpanded((previous) => !previous)}
            type="button"
          >
            {expanded ? "Tout replier" : "Tout déplier"}
          </button>
        ) : null}
      </div>
      <div className="max-h-64 overflow-auto px-3 py-2">
        {isEmpty ? (
          <p className="flex items-center gap-1.5 py-2 font-mono text-[10px] text-[#5c6889]">
            <Icon name="lock" size={10} /> Valeur non fournie pour cet enregistrement.
          </p>
        ) : (
          <JsonNode depth={0} path={pathLabel} rootExpanded={expanded} value={value} />
        )}
      </div>
      {!isEmpty ? (
        <div className="border-t border-white/[0.07] px-4 py-2">
          <button
            className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-[#5c6889] transition hover:text-[#7dd3fc]"
            onClick={() => {
              navigator.clipboard?.writeText(JSON.stringify(value, null, 2));
            }}
            type="button"
          >
            <Icon name="copy" size={10} /> Copier le JSON complet
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function JsonHint() {
  return (
    <p className="flex items-center gap-1.5 text-[9px] text-[#5c6889]">
      <KBD>⌘K</KBD> recherche · clic sur une clé pour copier son chemin
    </p>
  );
}