import React from 'react';
import { Button, ButtonGroup, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { LayoutAlgorithm } from './types';

interface FlowControlsProps {
  onFitView: () => void;
  onRecalculateLayout: () => void;
  circularDependencies: string[];
  layoutAlgorithm: LayoutAlgorithm;
  onLayoutChange: (algorithm: LayoutAlgorithm) => void;
}

const FlowControls: React.FC<FlowControlsProps> = ({
  onFitView,
  onRecalculateLayout,
  circularDependencies,
  layoutAlgorithm,
  onLayoutChange
}) => {
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Circular Dependency Warning */}
      {circularDependencies.length > 0 && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-400" size={16} />
            <span className="text-red-400 text-sm font-medium">
              Circular Dependencies Detected
            </span>
          </div>
          <div className="text-xs text-red-300">
            {circularDependencies.slice(0, 2).map((cycle, index) => (
              <div key={index} className="mb-1">
                {cycle}
              </div>
            ))}
            {circularDependencies.length > 2 && (
              <div className="text-red-400">
                +{circularDependencies.length - 2} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-light_blue-500/10 border border-light_blue-500/30 rounded-lg p-3 text-xs max-w-64">
        <div className="text-light_blue font-medium mb-2">💡 Interactive Features</div>
        <div className="text-gray-300 space-y-1">
          <div>• Click edit icon to modify tasks</div>
          <div>• Drag from node edge to create dependencies</div>
          <div>• Select edge and press Delete to remove</div>
          <div>• Click dependency chips to highlight</div>
          <div>• Use ↻ button to reorganize layout</div>
        </div>
      </div>

      {/* Layout Algorithm Selector */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg">
        <Dropdown>
          <DropdownTrigger>
            <Button
              size="sm"
              variant="flat"
              className="text-white hover:bg-white/20"
              startContent={<Settings size={16} />}
            >
              {layoutAlgorithm === 'hierarchical' ? 'Hierarchical' :
               layoutAlgorithm === 'layered' ? 'Layered' : 'Force-Directed'}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Layout algorithms"
            selectedKeys={[layoutAlgorithm]}
            selectionMode="single"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as LayoutAlgorithm;
              if (selected) onLayoutChange(selected);
            }}
          >
            <DropdownItem key="layered">Layered Layout</DropdownItem>
            <DropdownItem key="hierarchical">Hierarchical Layout</DropdownItem>
            <DropdownItem key="force-directed">Force-Directed Layout</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Control Buttons */}
      <ButtonGroup className="bg-white/10 backdrop-blur-sm">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="text-white hover:bg-white/20"
          onPress={() => zoomIn()}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </Button>
        
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="text-white hover:bg-white/20"
          onPress={() => zoomOut()}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </Button>
        
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="text-white hover:bg-white/20"
          onPress={onFitView}
          title="Fit View"
        >
          <Maximize size={16} />
        </Button>
        
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="text-white hover:bg-white/20"
          onPress={onRecalculateLayout}
          title="Recalculate Layout"
        >
          <RotateCcw size={16} />
        </Button>
      </ButtonGroup>

      {/* Legend */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-xs max-w-64">
        <div className="text-white font-medium mb-2">Difficulty Levels</div>
        <div className="space-y-1 mb-3">
          {[
            { level: 1, color: '#2dd4bf', label: 'Very Easy' },
            { level: 2, color: '#60a5fa', label: 'Easy' },
            { level: 3, color: '#facc15', label: 'Medium' },
            { level: 4, color: '#f87171', label: 'Hard' },
            { level: 5, color: '#a855f7', label: 'Very Hard' },
          ].map(({ level, color, label }) => (
            <div key={level} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>
        
        <div className="text-white font-medium mb-2 border-t border-white/20 pt-2">Dependency Lines</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-light_blue-500"/>
            <span className="text-gray-300">Normal flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-yellow-400"/>
            <span className="text-gray-300">Medium jump</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-400 border-dashed border-t border-red-400"/>
            <span className="text-gray-300">Complex jump ⚠️</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowControls;