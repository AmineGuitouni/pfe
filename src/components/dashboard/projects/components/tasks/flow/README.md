# React Flow Task Visualization

This module provides a React Flow-based visualization for task dependencies in the project creation workflow.

## Features

- **Interactive Task Nodes**: Click to edit or delete tasks directly from the flow view
- **Interactive Task Editing**: Full task editing capabilities directly from flow nodes
- **Manual Dependency Management**: Drag to create dependencies, delete to remove them
- **Advanced Layout Algorithms**: Three different layout options for optimal organization
- **Smart Dependency Visualization**: Color-coded edges based on difficulty complexity
- **Difficulty Level Coding**: Color-coded nodes based on task difficulty (1-5 scale)
- **Search Integration**: Search functionality with visual highlighting
- **Circular Dependency Detection**: Automatic detection and warning for circular dependencies
- **View Toggle**: Seamless switching between list and flow views
- **Enhanced Spacing**: Improved node positioning and better visual organization

## Layout Algorithms

### 1. Layered Layout (Default)
- Uses topological sorting for optimal dependency flow
- Groups tasks in horizontal layers based on dependency depth
- Sorts within layers by difficulty level for better readability
- Best for: Complex projects with multiple dependency chains

### 2. Hierarchical Layout
- Traditional tree-like structure with improved spacing
- Centers nodes within levels for balanced appearance
- Handles circular dependencies gracefully
- Best for: Simple linear dependencies

### 3. Force-Directed Layout
- Physics-based simulation for organic positioning
- Attractive forces for dependencies, repulsive forces between unrelated tasks
- Self-organizing layout that minimizes edge crossings
- Best for: Complex interconnected task networks

## Edge Styling

### Smart Edge Colors
- **Blue**: Normal dependency flow (difficulty difference ≤ 1)
- **Yellow**: Medium complexity jump (difficulty difference = 2)
- **Red (Dashed)**: Complex jump with warning (difficulty difference > 2)

### Visual Indicators
- **Edge Thickness**: Inversely proportional to number of dependencies
- **Animation**: Complex dependencies are animated for attention
- **Warning Icons**: ⚠️ appears on high-complexity dependencies

## Interactive Features

### Task Editing
- **Full Edit Modal**: Click the edit icon on any task node to open the complete editing interface
- **Dependency Management**: Add/remove dependencies directly through the modal
- **Real-time Updates**: Changes are immediately reflected in the flow visualization

### Manual Dependency Creation
- **Drag to Connect**: Drag from any node's edge (handle) to another node to create a dependency
- **Visual Feedback**: Handles glow and pulse during connection mode
- **Smart Validation**: Prevents self-dependencies and duplicate connections

### Dependency Removal
- **Select and Delete**: Click on any edge to select it, then press Delete/Backspace to remove
- **Visual Confirmation**: Selected edges are highlighted in blue with enhanced glow
- **Immediate Update**: Dependency removal is instantly reflected in the task data

### Layout Persistence
- **Manual Positioning**: User-adjusted node positions are preserved during updates
- **On-Demand Recalculation**: Layout algorithms only run when explicitly triggered
- **Recalculate Button**: Click the ↻ button to reorganize layout using current algorithm
- **Algorithm Changes**: Switching layout algorithms automatically recalculates positions

### Enhanced UX
- **Interactive Handles**: Node connection points expand and glow on hover
- **Connection Animation**: Live connection lines animate during drag operations
- **Clear Instructions**: Built-in help panel explains all interactive features
- **Keyboard Support**: Standard keyboard shortcuts for deletion and navigation
- **Position Memory**: Manual node arrangements persist across dependency changes

## Components

### TaskFlowView
Main React Flow container component that orchestrates the entire flow visualization.

### TaskNode
Custom React Flow node component representing individual tasks with:
- Task title and description
- Difficulty level indicator
- Edit/delete actions
- Dependency chips
- Visual highlighting

### FlowControls
Control panel providing:
- Zoom in/out controls
- Fit to view functionality
- Layout reset
- Circular dependency warnings
- Difficulty level legend

### Layout Utils
Utilities for:
- Converting task data to React Flow format
- Calculating hierarchical node positions
- Detecting circular dependencies
- Managing node/edge styling

## Usage

The flow view is integrated into the TaskList component and can be accessed via the view toggle buttons in the task management interface.

## Styling

Custom CSS styles are provided in `flow.css` to ensure proper integration with the existing design system and color palette.