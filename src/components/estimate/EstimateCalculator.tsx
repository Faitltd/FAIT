import React, { useState, useEffect } from 'react';
import {
  EstimateItem,
  CalculationType,
  FoundationCalculationParams,
  WallCalculationParams,
  RoofCalculationParams,
  FloorCalculationParams,
  ConcreteCalculationParams,
  FramingCalculationParams,
  DrywallCalculationParams,
  PaintCalculationParams,
  CustomCalculationParams
} from '../../types/estimate';
import { estimateService } from '../../services/EstimateService';

// Import form components
import FoundationForm from './calculationForms/FoundationForm';
import WallForm from './calculationForms/WallForm';
import RoofForm from './calculationForms/RoofForm';
import FloorForm from './calculationForms/FloorForm';
import ConcreteForm from './calculationForms/ConcreteForm';
import FramingForm from './calculationForms/FramingForm';
import DrywallForm from './calculationForms/DrywallForm';
import PaintForm from './calculationForms/PaintForm';
import CustomForm from './calculationForms/CustomForm';

interface EstimateCalculatorProps {
  item: EstimateItem;
  onCalculationComplete: (updatedItem: EstimateItem) => void;
  onCancel: () => void;
}

const EstimateCalculator: React.FC<EstimateCalculatorProps> = ({
  item,
  onCalculationComplete,
  onCancel
}) => {
  const [calculationType, setCalculationType] = useState<CalculationType>(
    item.calculations?.[0]?.calculation_type as CalculationType || 'custom'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Foundation parameters
  const [foundationParams, setFoundationParams] = useState<FoundationCalculationParams>({
    length: 0,
    width: 0,
    depth: 0,
    thickness: 4,
    type: 'slab',
    reinforcement: false,
    wastage: 5
  });

  // Wall parameters
  const [wallParams, setWallParams] = useState<WallCalculationParams>({
    length: 0,
    height: 0,
    thickness: 0,
    openings: [],
    type: 'wood',
    insulation: false,
    wastage: 10
  });

  // Roof parameters
  const [roofParams, setRoofParams] = useState<RoofCalculationParams>({
    length: 0,
    width: 0,
    pitch: 0,
    overhang: 0,
    type: 'shingle',
    wastage: 15
  });

  // Floor parameters
  const [floorParams, setFloorParams] = useState<FloorCalculationParams>({
    length: 0,
    width: 0,
    type: 'wood',
    wastage: 10
  });

  // Concrete parameters
  const [concreteParams, setConcreteParams] = useState<ConcreteCalculationParams>({
    length: 0,
    width: 0,
    depth: 0,
    reinforcement: false,
    psi: 3000,
    wastage: 10
  });

  // Framing parameters
  const [framingParams, setFramingParams] = useState<FramingCalculationParams>({
    length: 0,
    height: 0,
    spacing: 16,
    type: '2x4',
    wastage: 15
  });

  // Drywall parameters
  const [drywallParams, setDrywallParams] = useState<DrywallCalculationParams>({
    length: 0,
    height: 0,
    openings: [],
    thickness: '1/2',
    wastage: 10
  });

  // Paint parameters
  const [paintParams, setPaintParams] = useState<PaintCalculationParams>({
    area: 0,
    coats: 2,
    type: 'interior',
    wastage: 10
  });

  // Custom parameters
  const [customParams, setCustomParams] = useState<CustomCalculationParams>({
    formula: '',
    variables: {}
  });

  // Custom variables
  const [customVariables, setCustomVariables] = useState<{ name: string; value: number }[]>([
    { name: 'x', value: 0 }
  ]);

  // Load existing calculation parameters if available
  useEffect(() => {
    if (item.calculations && item.calculations.length > 0) {
      const calculation = item.calculations[0];
      setCalculationType(calculation.calculation_type as CalculationType);

      switch (calculation.calculation_type) {
        case 'foundation':
          setFoundationParams(calculation.parameters as FoundationCalculationParams);
          break;
        case 'wall':
          setWallParams(calculation.parameters as WallCalculationParams);
          break;
        case 'roof':
          setRoofParams(calculation.parameters as RoofCalculationParams);
          break;
        case 'floor':
          setFloorParams(calculation.parameters as FloorCalculationParams);
          break;
        case 'concrete':
          setConcreteParams(calculation.parameters as ConcreteCalculationParams);
          break;
        case 'framing':
          setFramingParams(calculation.parameters as FramingCalculationParams);
          break;
        case 'drywall':
          setDrywallParams(calculation.parameters as DrywallCalculationParams);
          break;
        case 'paint':
          setPaintParams(calculation.parameters as PaintCalculationParams);
          break;
        case 'custom':
          const params = calculation.parameters as CustomCalculationParams;
          setCustomParams(params);
          if (params.variables) {
            setCustomVariables(
              Object.entries(params.variables).map(([name, value]) => ({ name, value: value as number }))
            );
          }
          break;
      }
    }
  }, [item.calculations]);

  // Handle form submission
  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let parameters: any;

      switch (calculationType) {
        case 'foundation':
          parameters = foundationParams;
          break;
        case 'wall':
          parameters = wallParams;
          break;
        case 'roof':
          parameters = roofParams;
          break;
        case 'floor':
          parameters = floorParams;
          break;
        case 'concrete':
          parameters = concreteParams;
          break;
        case 'framing':
          parameters = framingParams;
          break;
        case 'drywall':
          parameters = drywallParams;
          break;
        case 'paint':
          parameters = paintParams;
          break;
        case 'custom':
          // Convert custom variables array to object
          const variables: Record<string, number> = {};
          customVariables.forEach(v => {
            variables[v.name] = v.value;
          });

          parameters = {
            ...customParams,
            variables
          };
          break;
      }

      const calculation = await estimateService.calculateItem(
        item.id,
        calculationType,
        parameters
      );

      // Get the updated item
      const { data, error } = await estimateService.getItemById(item.id);

      if (error) throw error;

      onCalculationComplete(data);
    } catch (err: any) {
      console.error('Error calculating item:', err);
      setError(err.message || 'Failed to calculate item');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for different calculation types
  const handleFoundationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFoundationParams(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? parseFloat(value)
          : value
    }));
  };

  const handleWallChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setWallParams(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? parseFloat(value)
          : value
    }));
  };

  const handleRoofChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setRoofParams(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleFloorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFloorParams(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleConcreteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setConcreteParams(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? parseFloat(value)
          : value
    }));
  };

  const handleFramingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFramingParams(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleDrywallChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setDrywallParams(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handlePaintChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setPaintParams(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleCustomFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomParams(prev => ({
      ...prev,
      formula: e.target.value
    }));
  };

  const handleCustomVariableChange = (index: number, field: 'name' | 'value', value: string) => {
    const newVariables = [...customVariables];

    if (field === 'name') {
      newVariables[index].name = value;
    } else {
      newVariables[index].value = parseFloat(value) || 0;
    }

    setCustomVariables(newVariables);
  };

  const addCustomVariable = () => {
    setCustomVariables([...customVariables, { name: '', value: 0 }]);
  };

  const removeCustomVariable = (index: number) => {
    const newVariables = [...customVariables];
    newVariables.splice(index, 1);
    setCustomVariables(newVariables);
  };

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">Material Calculator</h4>
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <div className="mb-4">
          <label htmlFor="calculation-type" className="block text-sm font-medium text-gray-700">
            Calculation Type
          </label>
          <select
            id="calculation-type"
            value={calculationType}
            onChange={(e) => setCalculationType(e.target.value as CalculationType)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="foundation">Foundation</option>
            <option value="wall">Wall</option>
            <option value="roof">Roof</option>
            <option value="floor">Floor</option>
            <option value="concrete">Concrete</option>
            <option value="framing">Framing</option>
            <option value="drywall">Drywall</option>
            <option value="paint">Paint</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Calculation Forms */}
        <div className="mt-4">
          {calculationType === 'foundation' && (
            <FoundationForm
              params={foundationParams}
              onChange={handleFoundationChange}
            />
          )}

          {calculationType === 'wall' && (
            <WallForm
              params={wallParams}
              onChange={handleWallChange}
            />
          )}

          {calculationType === 'roof' && (
            <RoofForm
              params={roofParams}
              onChange={handleRoofChange}
            />
          )}

          {calculationType === 'floor' && (
            <FloorForm
              params={floorParams}
              onChange={handleFloorChange}
            />
          )}

          {calculationType === 'concrete' && (
            <ConcreteForm
              params={concreteParams}
              onChange={handleConcreteChange}
            />
          )}

          {calculationType === 'framing' && (
            <FramingForm
              params={framingParams}
              onChange={handleFramingChange}
            />
          )}

          {calculationType === 'drywall' && (
            <DrywallForm
              params={drywallParams}
              onChange={handleDrywallChange}
            />
          )}

          {calculationType === 'paint' && (
            <PaintForm
              params={paintParams}
              onChange={handlePaintChange}
            />
          )}

          {calculationType === 'custom' && (
            <CustomForm
              params={customParams}
              variables={customVariables}
              onFormulaChange={handleCustomFormulaChange}
              onVariableChange={handleCustomVariableChange}
              onAddVariable={addCustomVariable}
              onRemoveVariable={removeCustomVariable}
            />
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : (
              'Calculate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstimateCalculator;
