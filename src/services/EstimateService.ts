import { supabase } from '../lib/supabase';
import {
  ProjectEstimate,
  EstimateCategory,
  EstimateItem,
  EstimateAssumption,
  EstimateCalculation,
  EstimateTemplate,
  CalculationType
} from '../types/estimate';
import { calculateEstimate } from '../utils/estimateCalculations';

class EstimateService {
  /**
   * Get all estimates for a project
   * @param projectId The project ID
   * @returns Array of project estimates
   */
  async getProjectEstimates(projectId: string): Promise<ProjectEstimate[]> {
    try {
      const { data, error } = await supabase
        .from('project_estimates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project estimates:', error);
        throw error;
      }

      return data as ProjectEstimate[];
    } catch (error) {
      console.error('Error in getProjectEstimates:', error);
      throw error;
    }
  }

  /**
   * Get a specific item by ID with calculations
   * @param itemId The item ID
   * @returns The item data with calculations
   */
  async getItemById(itemId: string): Promise<{ data: EstimateItem; error: any }> {
    try {
      // Get the item
      const { data: item, error: itemError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) {
        console.error('Error fetching item:', itemError);
        return { data: null, error: itemError };
      }

      // Get calculations for the item
      const { data: calculations, error: calculationsError } = await supabase
        .from('estimate_calculations')
        .select('*')
        .eq('item_id', itemId);

      if (calculationsError) {
        console.error('Error fetching calculations:', calculationsError);
        return { data: null, error: calculationsError };
      }

      return {
        data: {
          ...item,
          calculations
        } as EstimateItem,
        error: null
      };
    } catch (error) {
      console.error('Error in getItemById:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a specific estimate by ID with all related data
   * @param estimateId The estimate ID
   * @returns The estimate data with categories, items, and assumptions
   */
  async getEstimateById(estimateId: string): Promise<ProjectEstimate | null> {
    try {
      // Get the estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('project_estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError) {
        console.error('Error fetching estimate:', estimateError);
        throw estimateError;
      }

      // Get categories
      const { data: categories, error: categoriesError } = await supabase
        .from('estimate_categories')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching estimate categories:', categoriesError);
        throw categoriesError;
      }

      // Get assumptions
      const { data: assumptions, error: assumptionsError } = await supabase
        .from('estimate_assumptions')
        .select('*')
        .eq('estimate_id', estimateId);

      if (assumptionsError) {
        console.error('Error fetching estimate assumptions:', assumptionsError);
        throw assumptionsError;
      }

      // Get items for each category
      const categoriesWithItems: EstimateCategory[] = [];

      for (const category of categories) {
        const { data: items, error: itemsError } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('category_id', category.id)
          .order('sort_order', { ascending: true });

        if (itemsError) {
          console.error('Error fetching estimate items:', itemsError);
          throw itemsError;
        }

        // Get calculations for each item
        const itemsWithCalculations: EstimateItem[] = [];

        for (const item of items) {
          const { data: calculations, error: calculationsError } = await supabase
            .from('estimate_calculations')
            .select('*')
            .eq('item_id', item.id);

          if (calculationsError) {
            console.error('Error fetching estimate calculations:', calculationsError);
            throw calculationsError;
          }

          itemsWithCalculations.push({
            ...item,
            calculations: calculations as EstimateCalculation[]
          });
        }

        categoriesWithItems.push({
          ...category,
          items: itemsWithCalculations
        });
      }

      return {
        ...estimate,
        categories: categoriesWithItems,
        assumptions: assumptions as EstimateAssumption[]
      } as ProjectEstimate;
    } catch (error) {
      console.error('Error in getEstimateById:', error);
      throw error;
    }
  }

  /**
   * Create a new estimate
   * @param estimate The estimate data
   * @returns The created estimate
   */
  async createEstimate(estimate: Omit<ProjectEstimate, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectEstimate> {
    try {
      const { data, error } = await supabase
        .from('project_estimates')
        .insert({
          project_id: estimate.project_id,
          name: estimate.name,
          description: estimate.description,
          created_by: estimate.created_by,
          status: estimate.status,
          total_cost: estimate.total_cost || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating estimate:', error);
        throw error;
      }

      return data as ProjectEstimate;
    } catch (error) {
      console.error('Error in createEstimate:', error);
      throw error;
    }
  }

  /**
   * Create an estimate from a template
   * @param projectId The project ID
   * @param templateId The template ID
   * @param createdBy The user ID creating the estimate
   * @returns The created estimate
   */
  async createEstimateFromTemplate(
    projectId: string,
    templateId: string,
    createdBy: string
  ): Promise<ProjectEstimate> {
    try {
      // Get the template
      const { data: template, error: templateError } = await supabase
        .from('estimate_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        console.error('Error fetching template:', templateError);
        throw templateError;
      }

      // Create the estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('project_estimates')
        .insert({
          project_id: projectId,
          name: template.name,
          description: template.description,
          created_by: createdBy,
          status: 'draft',
          total_cost: 0
        })
        .select()
        .single();

      if (estimateError) {
        console.error('Error creating estimate:', estimateError);
        throw estimateError;
      }

      // Create categories, items, and assumptions from template
      const templateData = template.template_data;

      // Create categories and items
      for (const categoryData of templateData.categories) {
        const { data: category, error: categoryError } = await supabase
          .from('estimate_categories')
          .insert({
            estimate_id: estimate.id,
            name: categoryData.name,
            description: categoryData.description,
            sort_order: categoryData.sort_order
          })
          .select()
          .single();

        if (categoryError) {
          console.error('Error creating category:', categoryError);
          throw categoryError;
        }

        // Create items for this category
        for (const itemData of categoryData.items) {
          const { data: item, error: itemError } = await supabase
            .from('estimate_items')
            .insert({
              category_id: category.id,
              name: itemData.name,
              description: itemData.description,
              quantity: 0,
              unit: itemData.unit,
              unit_cost: itemData.unit_cost,
              total_cost: 0,
              sort_order: itemData.sort_order
            })
            .select()
            .single();

          if (itemError) {
            console.error('Error creating item:', itemError);
            throw itemError;
          }

          // Create calculation if provided
          if (itemData.calculation_type && itemData.default_parameters) {
            await supabase
              .from('estimate_calculations')
              .insert({
                item_id: item.id,
                calculation_type: itemData.calculation_type,
                parameters: itemData.default_parameters,
                result: {}
              });
          }
        }
      }

      // Create assumptions
      for (const assumptionData of templateData.assumptions) {
        await supabase
          .from('estimate_assumptions')
          .insert({
            estimate_id: estimate.id,
            description: assumptionData.description,
            impact: assumptionData.impact
          });
      }

      // Return the created estimate with all data
      return this.getEstimateById(estimate.id) as Promise<ProjectEstimate>;
    } catch (error) {
      console.error('Error in createEstimateFromTemplate:', error);
      throw error;
    }
  }

  /**
   * Update an existing estimate
   * @param estimateId The estimate ID
   * @param estimateData The updated estimate data
   * @returns The updated estimate
   */
  async updateEstimate(
    estimateId: string,
    estimateData: Partial<ProjectEstimate>
  ): Promise<ProjectEstimate> {
    try {
      const { data, error } = await supabase
        .from('project_estimates')
        .update({
          name: estimateData.name,
          description: estimateData.description,
          status: estimateData.status,
          total_cost: estimateData.total_cost
        })
        .eq('id', estimateId)
        .select()
        .single();

      if (error) {
        console.error('Error updating estimate:', error);
        throw error;
      }

      return data as ProjectEstimate;
    } catch (error) {
      console.error('Error in updateEstimate:', error);
      throw error;
    }
  }

  /**
   * Delete an estimate
   * @param estimateId The estimate ID
   * @returns True if successful
   */
  async deleteEstimate(estimateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_estimates')
        .delete()
        .eq('id', estimateId);

      if (error) {
        console.error('Error deleting estimate:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteEstimate:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   * @param category The category data
   * @returns The created category
   */
  async createCategory(
    category: Omit<EstimateCategory, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EstimateCategory> {
    try {
      const { data, error } = await supabase
        .from('estimate_categories')
        .insert({
          estimate_id: category.estimate_id,
          name: category.name,
          description: category.description,
          sort_order: category.sort_order
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      return data as EstimateCategory;
    } catch (error) {
      console.error('Error in createCategory:', error);
      throw error;
    }
  }

  /**
   * Create a new item
   * @param item The item data
   * @returns The created item
   */
  async createItem(
    item: Omit<EstimateItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EstimateItem> {
    try {
      const { data, error } = await supabase
        .from('estimate_items')
        .insert({
          category_id: item.category_id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          total_cost: item.quantity * item.unit_cost,
          sort_order: item.sort_order
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating item:', error);
        throw error;
      }

      return data as EstimateItem;
    } catch (error) {
      console.error('Error in createItem:', error);
      throw error;
    }
  }

  /**
   * Update an item
   * @param itemId The item ID
   * @param itemData The updated item data
   * @returns The updated item
   */
  async updateItem(
    itemId: string,
    itemData: Partial<EstimateItem>
  ): Promise<EstimateItem> {
    try {
      // Calculate total cost if quantity or unit_cost is provided
      let totalCost = itemData.total_cost;

      if (itemData.quantity !== undefined || itemData.unit_cost !== undefined) {
        // Get current item data for any missing fields
        const { data: currentItem, error: currentItemError } = await supabase
          .from('estimate_items')
          .select('quantity, unit_cost')
          .eq('id', itemId)
          .single();

        if (currentItemError) {
          console.error('Error fetching current item:', currentItemError);
          throw currentItemError;
        }

        const quantity = itemData.quantity !== undefined ? itemData.quantity : currentItem.quantity;
        const unitCost = itemData.unit_cost !== undefined ? itemData.unit_cost : currentItem.unit_cost;

        totalCost = quantity * unitCost;
      }

      const { data, error } = await supabase
        .from('estimate_items')
        .update({
          name: itemData.name,
          description: itemData.description,
          quantity: itemData.quantity,
          unit: itemData.unit,
          unit_cost: itemData.unit_cost,
          total_cost: totalCost,
          sort_order: itemData.sort_order
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('Error updating item:', error);
        throw error;
      }

      // Update the total cost of the estimate
      await this.updateEstimateTotalCost(data.category_id);

      return data as EstimateItem;
    } catch (error) {
      console.error('Error in updateItem:', error);
      throw error;
    }
  }

  /**
   * Create or update a calculation for an item
   * @param itemId The item ID
   * @param calculationType The calculation type
   * @param parameters The calculation parameters
   * @returns The calculation result
   */
  async calculateItem(
    itemId: string,
    calculationType: CalculationType,
    parameters: Record<string, any>
  ): Promise<EstimateCalculation> {
    try {
      // Perform the calculation
      const result = calculateEstimate(calculationType, parameters);

      // Get the current item
      const { data: item, error: itemError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) {
        console.error('Error fetching item:', itemError);
        throw itemError;
      }

      // Update quantity based on calculation result
      let quantity = 0;

      switch (calculationType) {
        case 'foundation':
        case 'concrete':
          quantity = result.concreteVolume; // cubic yards
          break;
        case 'wall':
          quantity = result.wallArea; // square feet
          break;
        case 'roof':
          quantity = result.roofArea; // square feet
          break;
        case 'floor':
          quantity = result.floorArea; // square feet
          break;
        case 'framing':
          quantity = result.boardFeet; // board feet
          break;
        case 'drywall':
          quantity = result.sheetsNeeded; // sheets
          break;
        case 'paint':
          quantity = result.gallonsNeeded; // gallons
          break;
        case 'custom':
          quantity = result.result; // custom result
          break;
      }

      // Update the item with the new quantity and total cost
      await this.updateItem(itemId, {
        quantity,
        total_cost: quantity * item.unit_cost
      });

      // Check if a calculation already exists
      const { data: existingCalc, error: existingCalcError } = await supabase
        .from('estimate_calculations')
        .select('*')
        .eq('item_id', itemId)
        .maybeSingle();

      if (existingCalcError) {
        console.error('Error checking existing calculation:', existingCalcError);
        throw existingCalcError;
      }

      let calculation;

      if (existingCalc) {
        // Update existing calculation
        const { data, error } = await supabase
          .from('estimate_calculations')
          .update({
            calculation_type: calculationType,
            parameters,
            result
          })
          .eq('id', existingCalc.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating calculation:', error);
          throw error;
        }

        calculation = data;
      } else {
        // Create new calculation
        const { data, error } = await supabase
          .from('estimate_calculations')
          .insert({
            item_id: itemId,
            calculation_type: calculationType,
            parameters,
            result
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating calculation:', error);
          throw error;
        }

        calculation = data;
      }

      return calculation as EstimateCalculation;
    } catch (error) {
      console.error('Error in calculateItem:', error);
      throw error;
    }
  }

  /**
   * Update the total cost of an estimate based on its items
   * @param categoryId The category ID to start from
   * @returns The updated total cost
   */
  private async updateEstimateTotalCost(categoryId: string): Promise<number> {
    try {
      // Get the category to find the estimate ID
      const { data: category, error: categoryError } = await supabase
        .from('estimate_categories')
        .select('estimate_id')
        .eq('id', categoryId)
        .single();

      if (categoryError) {
        console.error('Error fetching category:', categoryError);
        throw categoryError;
      }

      // Get all categories for this estimate
      const { data: categories, error: categoriesError } = await supabase
        .from('estimate_categories')
        .select('id')
        .eq('estimate_id', category.estimate_id);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      // Calculate total cost from all items in all categories
      let totalCost = 0;

      for (const cat of categories) {
        const { data: items, error: itemsError } = await supabase
          .from('estimate_items')
          .select('total_cost')
          .eq('category_id', cat.id);

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          throw itemsError;
        }

        for (const item of items) {
          totalCost += item.total_cost || 0;
        }
      }

      // Update the estimate with the new total cost
      const { data, error } = await supabase
        .from('project_estimates')
        .update({ total_cost: totalCost })
        .eq('id', category.estimate_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating estimate total cost:', error);
        throw error;
      }

      return totalCost;
    } catch (error) {
      console.error('Error in updateEstimateTotalCost:', error);
      throw error;
    }
  }

  /**
   * Get all estimate templates
   * @param includePrivate Whether to include private templates
   * @param userId The user ID for private templates
   * @returns Array of estimate templates
   */
  async getEstimateTemplates(includePrivate: boolean = false, userId?: string): Promise<EstimateTemplate[]> {
    try {
      let query = supabase
        .from('estimate_templates')
        .select('*')
        .eq('is_public', true);

      if (includePrivate && userId) {
        query = supabase
          .from('estimate_templates')
          .select('*')
          .or(`is_public.eq.true,created_by.eq.${userId}`);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        console.error('Error fetching estimate templates:', error);
        throw error;
      }

      return data as EstimateTemplate[];
    } catch (error) {
      console.error('Error in getEstimateTemplates:', error);
      throw error;
    }
  }

  /**
   * Create a template from an existing estimate
   * @param estimateId The estimate ID
   * @param name The template name
   * @param description The template description
   * @param isPublic Whether the template is public
   * @param createdBy The user ID creating the template
   * @returns The created template
   */
  async createTemplateFromEstimate(
    estimateId: string,
    name: string,
    description: string,
    isPublic: boolean,
    createdBy: string
  ): Promise<EstimateTemplate> {
    try {
      // Get the estimate with all data
      const estimate = await this.getEstimateById(estimateId);

      if (!estimate) {
        throw new Error('Estimate not found');
      }

      // Create template data structure
      const templateData = {
        categories: estimate.categories?.map(category => ({
          name: category.name,
          description: category.description,
          sort_order: category.sort_order,
          items: category.items?.map(item => ({
            name: item.name,
            description: item.description,
            unit: item.unit,
            unit_cost: item.unit_cost,
            sort_order: item.sort_order,
            calculation_type: item.calculations?.[0]?.calculation_type,
            default_parameters: item.calculations?.[0]?.parameters
          })) || []
        })) || [],
        assumptions: estimate.assumptions?.map(assumption => ({
          description: assumption.description,
          impact: assumption.impact
        })) || []
      };

      // Create the template
      const { data, error } = await supabase
        .from('estimate_templates')
        .insert({
          name,
          description,
          created_by: createdBy,
          is_public: isPublic,
          template_data: templateData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw error;
      }

      return data as EstimateTemplate;
    } catch (error) {
      console.error('Error in createTemplateFromEstimate:', error);
      throw error;
    }
  }
}

export const estimateService = new EstimateService();
export default estimateService;
