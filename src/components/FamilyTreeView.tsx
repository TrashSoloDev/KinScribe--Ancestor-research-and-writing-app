import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Ancestor, TimelineFact } from '../types/genealogy';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  User, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  ChevronRight, 
  ArrowRight,
  GitFork,
  Sparkles,
  Info,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface Props {
  ancestors: Ancestor[];
  facts: TimelineFact[];
  selectedAncestorId: string;
  onSelectAncestor: (ancestorId: string) => void;
  onOpenProfileModal?: (ancestor: Ancestor) => void;
  onSwitchToChronology?: () => void;
}

interface TreeNodeData {
  id: string;
  ancestor: Ancestor;
  factCount: number;
  children?: TreeNodeData[];
}

export const FamilyTreeView: React.FC<Props> = ({
  ancestors,
  facts,
  selectedAncestorId,
  onSelectAncestor,
  onOpenProfileModal,
  onSwitchToChronology
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // View settings
  const [treeOrientation, setTreeOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [treePerspective, setTreePerspective] = useState<'pedigree' | 'descendants'>('pedigree');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Find currently selected ancestor
  const selectedAncestor = useMemo(() => {
    return ancestors.find(a => a.id === selectedAncestorId) || ancestors[0];
  }, [ancestors, selectedAncestorId]);

  // Count facts per ancestor
  const factsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of facts) {
      map.set(f.ancestorId, (map.get(f.ancestorId) || 0) + 1);
    }
    return map;
  }, [facts]);

  // Build hierarchical tree data based on perspective
  const hierarchyData = useMemo<TreeNodeData | null>(() => {
    if (!ancestors || ancestors.length === 0) return null;

    const ancestorMap = new Map<string, Ancestor>();
    ancestors.forEach(a => ancestorMap.set(a.id, a));

    if (treePerspective === 'pedigree') {
      // Pedigree View: Ward Scott (Author) is root, expanding back to parents, grandparents, etc.
      const ward = ancestors.find(a => a.id === 'indi_ward_scott') || ancestors[0];

      const buildPedigreeNode = (anc: Ancestor, visited = new Set<string>()): TreeNodeData => {
        visited.add(anc.id);
        const childrenNodes: TreeNodeData[] = [];

        if (anc.parents && anc.parents.length > 0) {
          anc.parents.forEach(pId => {
            if (!visited.has(pId)) {
              const parentAnc = ancestorMap.get(pId);
              if (parentAnc) {
                childrenNodes.push(buildPedigreeNode(parentAnc, new Set(visited)));
              }
            }
          });
        }

        return {
          id: anc.id,
          ancestor: anc,
          factCount: factsCountMap.get(anc.id) || 0,
          children: childrenNodes.length > 0 ? childrenNodes : undefined
        };
      };

      return buildPedigreeNode(ward);
    } else {
      // Descendant View: Earliest ancestor (Samuel Thomas Scott 1852) is root, branching down
      const samuel = ancestors.find(a => a.id === 'indi_samuel_scott') || ancestors[ancestors.length - 1];

      // Find children by checking parents arrays
      const buildDescendantNode = (anc: Ancestor, visited = new Set<string>()): TreeNodeData => {
        visited.add(anc.id);
        const childAncestors = ancestors.filter(a => a.parents && a.parents.includes(anc.id) && !visited.has(a.id));

        return {
          id: anc.id,
          ancestor: anc,
          factCount: factsCountMap.get(anc.id) || 0,
          children: childAncestors.length > 0
            ? childAncestors.map(c => buildDescendantNode(c, new Set(visited)))
            : undefined
        };
      };

      return buildDescendantNode(samuel);
    }
  }, [ancestors, factsCountMap, treePerspective]);

  // Render D3 Tree
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !hierarchyData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const containerWidth = containerRef.current.clientWidth || 800;
    const containerHeight = Math.max(500, containerRef.current.clientHeight || 550);

    const isHorizontal = treeOrientation === 'horizontal';

    // Node dimensions
    const nodeWidth = 210;
    const nodeHeight = 88;

    // Create D3 Hierarchy & Tree Layout
    const root = d3.hierarchy<TreeNodeData>(hierarchyData);

    const treeLayout = d3.tree<TreeNodeData>()
      .nodeSize(isHorizontal ? [nodeHeight + 36, nodeWidth + 60] : [nodeWidth + 40, nodeHeight + 60]);

    treeLayout(root);

    // Zoom container
    const g = svg.append('g').attr('class', 'tree-viewport');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Draw connecting links with smooth bezier curves
    const linkGenerator = isHorizontal
      ? d3.linkHorizontal<d3.HierarchyPointLink<TreeNodeData>, d3.HierarchyPointNode<TreeNodeData>>()
          .x(d => d.y)
          .y(d => d.x)
      : d3.linkVertical<d3.HierarchyPointLink<TreeNodeData>, d3.HierarchyPointNode<TreeNodeData>>()
          .x(d => d.x)
          .y(d => d.y);

    g.selectAll('.tree-link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('d', linkGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const isSelectedPath = 
          d.source.data.id === selectedAncestorId || 
          d.target.data.id === selectedAncestorId;
        return isSelectedPath ? '#d97706' : '#cbd5e1';
      })
      .attr('stroke-width', (d) => {
        const isSelectedPath = 
          d.source.data.id === selectedAncestorId || 
          d.target.data.id === selectedAncestorId;
        return isSelectedPath ? 2.5 : 1.5;
      })
      .attr('stroke-dasharray', (d) => {
        return d.target.data.ancestor.relationship.includes('Maternal') ? '4 3' : 'none';
      })
      .attr('opacity', 0.85);

    // Draw Nodes using SVG <g> with foreignObject for styled interactive HTML
    const nodeGroup = g.selectAll('.tree-node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', d => {
        const x = d.x ?? 0;
        const y = d.y ?? 0;
        return isHorizontal 
          ? `translate(${y}, ${x - nodeHeight / 2})`
          : `translate(${x - nodeWidth / 2}, ${y})`;
      })
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        onSelectAncestor(d.data.id);
      })
      .on('mouseenter', (_, d) => {
        setHoveredNodeId(d.data.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      });

    // Render HTML card inside foreignObject
    nodeGroup.append('foreignObject')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .append('xhtml:div')
      .html(d => {
        const anc = d.data.ancestor;
        const isSelected = anc.id === selectedAncestorId;
        const factCount = d.data.factCount;
        const isMaternal = anc.treeBranch === 'Maternal';

        const genderBg = anc.gender === 'F' ? '#fdf2f8' : '#eff6ff';
        const genderColor = anc.gender === 'F' ? '#db2777' : '#2563eb';

        const borderClass = isSelected
          ? 'border-2 border-amber-600 shadow-md ring-3 ring-amber-400/40 bg-[#fffdf9]'
          : 'border border-stone-300 hover:border-amber-500 hover:shadow-xs bg-white';

        return `
          <div 
            class="h-full rounded-xl ${borderClass} p-2 flex flex-col justify-between transition-all select-none"
            style="box-sizing: border-box;"
          >
            <!-- Header Row: Name & Active Indicator -->
            <div class="flex items-start justify-between gap-1.5 min-w-0">
              <div class="flex items-center gap-1.5 min-w-0">
                <div 
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style="background-color: ${genderBg}; color: ${genderColor};"
                >
                  ${anc.gender === 'F' ? '♀' : '♂'}
                </div>
                <div class="min-w-0">
                  <h4 class="font-bold text-xs text-stone-900 truncate leading-tight">
                    ${anc.name}
                  </h4>
                  <p class="text-[10px] text-stone-500 truncate leading-tight">
                    ${anc.relationship}
                  </p>
                </div>
              </div>

              ${isSelected ? `
                <span class="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] shrink-0 shadow-2xs font-bold" title="Currently Selected">
                  ✓
                </span>
              ` : ''}
            </div>

            <!-- Footer Row: Lifespan & Verified Records Count -->
            <div class="flex items-center justify-between text-[10px] pt-1 border-t border-stone-100 text-stone-600 font-mono-data">
              <span class="font-medium text-stone-700">
                ${anc.birthYear} – ${anc.deathYear}
              </span>
              <span class="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                ${factCount} facts
              </span>
            </div>
          </div>
        `;
      });

    // Auto-center root node initially
    const initialTransform = isHorizontal
      ? d3.zoomIdentity.translate(40, containerHeight / 2).scale(0.9)
      : d3.zoomIdentity.translate(containerWidth / 2, 40).scale(0.85);

    svg.call(zoom.transform, initialTransform);

  }, [hierarchyData, selectedAncestorId, treeOrientation]);

  // Center tree view
  const handleResetView = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    const containerWidth = containerRef.current.clientWidth || 800;
    const containerHeight = Math.max(500, containerRef.current.clientHeight || 550);
    const isHorizontal = treeOrientation === 'horizontal';

    const defaultTransform = isHorizontal
      ? d3.zoomIdentity.translate(40, containerHeight / 2).scale(0.9)
      : d3.zoomIdentity.translate(containerWidth / 2, 40).scale(0.85);

    svg.transition().duration(400).call(zoomBehaviorRef.current.transform, defaultTransform);
  };

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.77);
  };

  return (
    <div className="space-y-3 font-sans-ui">
      {/* Top Controls Toolbar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Perspective Switcher & Orientation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTreePerspective('pedigree')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                treePerspective === 'pedigree'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="View ancestors branching back from Ward Scott"
            >
              <GitFork className="w-3.5 h-3.5 text-amber-700 rotate-180" />
              <span>Pedigree (Ancestors)</span>
            </button>

            <button
              onClick={() => setTreePerspective('descendants')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                treePerspective === 'descendants'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="View lineage descending from Samuel Thomas Scott (1852)"
            >
              <GitFork className="w-3.5 h-3.5 text-amber-700" />
              <span>Lineage (Descendants)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTreeOrientation('horizontal')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                treeOrientation === 'horizontal'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Horizontal Left-to-Right Layout"
            >
              Horizontal
            </button>
            <button
              onClick={() => setTreeOrientation('vertical')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                treeOrientation === 'vertical'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Vertical Top-to-Bottom Layout"
            >
              Vertical
            </button>
          </div>
        </div>

        {/* Right: Zoom controls & Touch Hint */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="hidden md:inline text-[11px] text-stone-400 mr-1">
            Drag to pan · Pinch/Scroll to zoom
          </span>

          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              onClick={handleZoomIn}
              className="p-1.5 sm:p-2 text-stone-700 hover:text-stone-900 hover:bg-white rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Zoom In (+)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 sm:p-2 text-stone-700 hover:text-stone-900 hover:bg-white rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Zoom Out (-)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 sm:p-2 text-stone-700 hover:text-stone-900 hover:bg-white rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Reset View"
              aria-label="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive D3 Canvas */}
      <div 
        ref={containerRef}
        className="relative bg-[#fcfbfa] border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs min-h-[460px] sm:min-h-[520px]"
      >
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(#d6d3d1 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <svg 
          ref={svgRef}
          className="w-full h-[460px] sm:h-[520px] cursor-grab active:cursor-grabbing block select-none"
        />

        {/* Selected Ancestor Quick Summary Drawer (Anchored inside the bottom of the canvas) */}
        {selectedAncestor && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:left-4 sm:right-auto sm:max-w-md bg-stone-900/95 text-stone-100 backdrop-blur-md border border-stone-700/80 rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h3 className="font-serif font-bold text-sm sm:text-base text-amber-200 truncate">
                    {selectedAncestor.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300 mt-0.5">
                  <span className="font-semibold text-amber-300/90">{selectedAncestor.relationship}</span>
                  <span>·</span>
                  <span className="font-mono-data text-stone-400">{selectedAncestor.birthYear} – {selectedAncestor.deathYear}</span>
                </div>
                <p className="text-xs text-stone-300 mt-1 line-clamp-2 font-serif-book">
                  {selectedAncestor.bioSummary}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 shrink-0">
                {onOpenProfileModal && (
                  <button
                    onClick={() => onOpenProfileModal(selectedAncestor)}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-stone-950 font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1 justify-center whitespace-nowrap min-h-[36px]"
                    title="Open comprehensive ancestor profile"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>
                )}

                {onSwitchToChronology && (
                  <button
                    onClick={onSwitchToChronology}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 justify-center whitespace-nowrap border border-stone-700 min-h-[36px]"
                    title="Jump to timeline records for this ancestor"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Timeline Facts</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Senior-Friendly Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-600">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-stone-700">Tree Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Male Ancestors
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" /> Female Ancestors
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-600 inline-block" /> Selected Context Link
          </span>
        </div>
        <div className="text-stone-500 text-[11px]">
          Click any card to focus your research timeline on that ancestor
        </div>
      </div>
    </div>
  );
};
