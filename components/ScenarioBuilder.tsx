import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Scenario, 
  Projection, 
  AdjustmentType, 
  ScenarioAdjustment, 
  TransactionType,
  Frequency
} from '../types';
import { Plus, Trash2, Play, GitBranch, X, ChevronRight, ChevronDown } from 'lucide-react';

interface ScenarioBuilderProps {
  projections: Projection[];
  scenarios: Scenario[];
  onAddScenario: (s: Scenario) => void;
  onUpdateScenario: (s: Scenario) => void;
  onDeleteScenario: (id: string) => void;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#ec4899'];

const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  projections,
  scenarios,
  onAddScenario,
  onUpdateScenario,
  onDeleteScenario
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  // Editing state
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [draftAdjustment, setDraftAdjustment] = useState<Partial<ScenarioAdjustment>>({
    type: AdjustmentType.PERCENTAGE_INCREASE,
    value: 10
  });

  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) return;
    const color = COLORS[scenarios.length % COLORS.length];
    const newScenario: Scenario = {
      id: uuidv4(),
      name: newScenarioName,
      color: color,
      isActive: true,
      adjustments: []
    };
    onAddScenario(newScenario);
    setNewScenarioName('');
    setEditingScenarioId(newScenario.id); // Auto open for editing
  };

  const handleAddAdjustment = (scenarioId: string) => {
    if (!draftAdjustment.projectionId || draftAdjustment.value === undefined) return;
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const newAdj: ScenarioAdjustment = {
      id: uuidv4(),
      projectionId: draftAdjustment.projectionId,
      type: draftAdjustment.type || AdjustmentType.PERCENTAGE_INCREASE,
      value: Number(draftAdjustment.value),
      startDate: draftAdjustment.startDate,
      endDate: draftAdjustment.endDate
    };

    onUpdateScenario({
      ...scenario,
      adjustments: [...scenario.adjustments, newAdj]
    });

    // Reset draft
    setDraftAdjustment({
      type: AdjustmentType.PERCENTAGE_INCREASE,
      value: 10
    });
  };

  const handleRemoveAdjustment = (scenarioId: string, adjId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    onUpdateScenario({
        ...scenario,
        adjustments: scenario.adjustments.filter(a => a.id !== adjId)
    });
  };

  const getProjectionName = (id: string) => projections.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
      <div 
        className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <GitBranch size={18} className="text-purple-600" />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-slate-800">What-If Scenarios</h2>
                <p className="text-xs text-slate-500">Simulate changes to your future</p>
            </div>
        </div>
        <div>
            {isOpen ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-6">
            {/* Create New Scenario */}
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Scenario Name (e.g. New Job, Baby)"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                    onClick={handleCreateScenario}
                    disabled={!newScenarioName.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                    Create
                </button>
            </div>

            {/* List Scenarios */}
            <div className="space-y-4">
                {scenarios.map(scenario => (
                    <div key={scenario.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="p-3 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <input 
                                    type="checkbox" 
                                    checked={scenario.isActive} 
                                    onChange={(e) => onUpdateScenario({...scenario, isActive: e.target.checked})}
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                />
                                <span className="font-semibold text-sm text-slate-700">{scenario.name}</span>
                                <span className="w-2 h-2 rounded-full" style={{ background: scenario.color }}></span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => setEditingScenarioId(editingScenarioId === scenario.id ? null : scenario.id)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    data-testid={`edit-scenario-${scenario.name.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    {editingScenarioId === scenario.id ? 'Done' : 'Edit'}
                                </button>
                                <button 
                                    onClick={() => onDeleteScenario(scenario.id)}
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Adjustments Editor */}
                        {editingScenarioId === scenario.id && (
                            <div className="p-3 bg-white space-y-3">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Modifications</p>
                                {scenario.adjustments.map(adj => (
                                    <div key={adj.id} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                        <div>
                                            <span className="font-medium text-slate-700">{getProjectionName(adj.projectionId)}</span>
                                            <span className="mx-2 text-slate-400">&rarr;</span>
                                            <span className="text-slate-600">
                                                {adj.type === AdjustmentType.PERCENTAGE_INCREASE && `Increase by ${adj.value}%`}
                                                {adj.type === AdjustmentType.PERCENTAGE_DECREASE && `Decrease by ${adj.value}%`}
                                                {adj.type === AdjustmentType.SET_AMOUNT && `Set to €${adj.value}`}
                                                {adj.type === AdjustmentType.ADD_AMOUNT && `Add €${adj.value}`}
                                                {adj.type === AdjustmentType.REMOVE_RECORD && `Remove this item`}
                                            </span>
                                            {adj.endDate && <span className="text-xs text-slate-400 ml-2">(Ends: {adj.endDate})</span>}
                                        </div>
                                        <button onClick={() => handleRemoveAdjustment(scenario.id, adj.id)}>
                                            <X size={14} className="text-red-400 hover:text-red-600" />
                                        </button>
                                    </div>
                                ))}

                                {/* Add New Adjustment Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                                    <select 
                                        className="text-xs border border-slate-300 rounded p-1.5 focus:outline-none focus:border-purple-500"
                                        value={draftAdjustment.projectionId || ''}
                                        onChange={(e) => setDraftAdjustment({...draftAdjustment, projectionId: e.target.value})}
                                        data-testid="adj-projection-select"
                                    >
                                        <option value="">Select Item...</option>
                                        {projections.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (€{p.amount})</option>
                                        ))}
                                    </select>
                                    
                                    <select 
                                        className="text-xs border border-slate-300 rounded p-1.5 focus:outline-none focus:border-purple-500"
                                        value={draftAdjustment.type}
                                        onChange={(e) => setDraftAdjustment({...draftAdjustment, type: e.target.value as AdjustmentType})}
                                        data-testid="adj-type-select"
                                    >
                                        <option value={AdjustmentType.PERCENTAGE_INCREASE}>Increase %</option>
                                        <option value={AdjustmentType.PERCENTAGE_DECREASE}>Decrease %</option>
                                        <option value={AdjustmentType.SET_AMOUNT}>Set Fixed Amount</option>
                                        <option value={AdjustmentType.ADD_AMOUNT}>Add Fixed Amount</option>
                                        <option value={AdjustmentType.REMOVE_RECORD}>Remove Item</option>
                                    </select>

                                    <input 
                                        type="number" 
                                        placeholder="Value"
                                        disabled={draftAdjustment.type === AdjustmentType.REMOVE_RECORD}
                                        className="text-xs border border-slate-300 rounded p-1.5 focus:outline-none focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-400"
                                        value={draftAdjustment.value}
                                        onChange={(e) => setDraftAdjustment({...draftAdjustment, value: parseFloat(e.target.value)})}
                                        data-testid="adj-value-input"
                                    />

                                    <input 
                                        type="date"
                                        placeholder="End Date (Optional)" 
                                        className="text-xs border border-slate-300 rounded p-1.5 focus:outline-none focus:border-purple-500"
                                        value={draftAdjustment.endDate || ''}
                                        onChange={(e) => setDraftAdjustment({...draftAdjustment, endDate: e.target.value})}
                                        data-testid="adj-end-date-input"
                                    />

                                    <button 
                                        onClick={() => handleAddAdjustment(scenario.id)}
                                        className="flex items-center justify-center bg-slate-800 text-white rounded text-xs hover:bg-slate-900"
                                        data-testid="add-adjustment-btn"
                                    >
                                        <Plus size={14} className="mr-1" /> Add
                                    </button>
                                </div>

                                {/* Scenario-Specific Projections */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Scenario-Only Items</p>
                                        <button 
                                            onClick={() => {
                                                const newProj: Projection = {
                                                    id: uuidv4(),
                                                    name: 'New Scenario Item',
                                                    amount: 0,
                                                    frequency: Frequency.ONCE,
                                                    startDate: new Date().toISOString().split('T')[0],
                                                    categoryId: '8',
                                                    type: TransactionType.EXPENSE,
                                                    isActive: true
                                                };
                                                onUpdateScenario({
                                                    ...scenario,
                                                    newProjections: [...(scenario.newProjections || []), newProj]
                                                });
                                            }}
                                            className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 font-bold transition-colors"
                                            data-testid="add-scenario-item-btn"
                                        >
                                            + Add New Expense/Income
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {(scenario.newProjections || []).map((np) => (
                                            <div key={np.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-emerald-50/50 p-2 rounded border border-emerald-100/50">
                                                <input 
                                                    type="text" 
                                                    value={np.name}
                                                    onChange={(e) => {
                                                        const updated = (scenario.newProjections || []).map(p => p.id === np.id ? {...p, name: e.target.value} : p);
                                                        onUpdateScenario({...scenario, newProjections: updated});
                                                    }}
                                                    className="text-xs bg-transparent border-none focus:ring-0 p-0 font-medium text-emerald-900"
                                                />
                                                <input 
                                                    type="number" 
                                                    value={np.amount}
                                                    onChange={(e) => {
                                                        const updated = (scenario.newProjections || []).map(p => p.id === np.id ? {...p, amount: parseFloat(e.target.value) || 0} : p);
                                                        onUpdateScenario({...scenario, newProjections: updated});
                                                    }}
                                                    className="text-xs bg-transparent border-none focus:ring-0 p-0 text-emerald-700"
                                                />
                                                <select
                                                    value={np.frequency}
                                                    onChange={(e) => {
                                                        const updated = (scenario.newProjections || []).map(p => p.id === np.id ? {...p, frequency: e.target.value as Frequency} : p);
                                                        onUpdateScenario({...scenario, newProjections: updated});
                                                    }}
                                                    className="text-[10px] bg-transparent border-none focus:ring-0 p-0 text-emerald-600"
                                                >
                                                    {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                                                </select>
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button 
                                                        onClick={() => {
                                                            const updated = (scenario.newProjections || []).map(p => p.id === np.id ? {...p, type: p.type === TransactionType.INCOME ? TransactionType.EXPENSE : TransactionType.INCOME} : p);
                                                            onUpdateScenario({...scenario, newProjections: updated});
                                                        }}
                                                        className={`text-[10px] px-1 rounded ${np.type === TransactionType.INCOME ? 'bg-emerald-200' : 'bg-red-100'}`}
                                                    >
                                                        {np.type}
                                                    </button>
                                                    <button onClick={() => {
                                                        onUpdateScenario({
                                                            ...scenario,
                                                            newProjections: (scenario.newProjections || []).filter(p => p.id !== np.id)
                                                        });
                                                    }}>
                                                        <X size={14} className="text-emerald-400 hover:text-emerald-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {scenarios.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        No scenarios created yet. Try adding one!
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioBuilder;