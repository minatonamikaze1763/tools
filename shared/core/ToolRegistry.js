/**
 * Tool Registry — Central registry for all 20 tools
 * Handles registration, discovery, and lazy loading
 */

export class ToolRegistry {
  constructor() {
    if (ToolRegistry.instance) {
      return ToolRegistry.instance;
    }
    this.tools = new Map();
    this.toolsByCategory = new Map();
    ToolRegistry.instance = this;
  }

  static getInstance() {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * Register a tool module
   * @param {Object} module - Tool module with default export containing tool definition
   */
  register(module) {
    const tool = module.default || module;
    if (!tool || !tool.id) {
      console.warn('[ToolRegistry] Invalid tool module:', module);
      return false;
    }

    // Validate required fields
    const required = ['id', 'title', 'description', 'icon', 'category', 'accept', 'single'];
    for (const field of required) {
      if (!tool[field]) {
        console.warn(`[ToolRegistry] Tool ${tool.id} missing required field: ${field}`);
        return false;
      }
    }

    // Set defaults
    tool.hints = tool.hints || '';
    tool.optionsSchema = tool.optionsSchema || {};
    tool.init = tool.init || (() => {});
    tool.cleanup = tool.cleanup || (() => {});
    tool.validate = tool.validate || (() => true);

    this.tools.set(tool.id, tool);

    // Index by category
    if (!this.toolsByCategory.has(tool.category)) {
      this.toolsByCategory.set(tool.category, []);
    }
    this.toolsByCategory.get(tool.category).push(tool);

    // Sort by display order if provided
    this.toolsByCategory.get(tool.category).sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(`[ToolRegistry] Registered: ${tool.id} (${tool.category})`);
    return true;
  }

  /**
   * Get tool by ID
   */
  get(id) {
    return this.tools.get(id);
  }

  /**
   * Get all tools
   */
  getAll() {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getByCategory(category) {
    return this.toolsByCategory.get(category) || [];
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.toolsByCategory.keys());
  }

  /**
   * Search tools by query
   */
  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();

    return this.getAll().filter(tool => {
      const searchable = `${tool.title} ${tool.description} ${tool.category} ${tool.hints}`.toLowerCase();
      return searchable.includes(q);
    });
  }

  /**
   * Get filtered tools (category + search)
   */
  getFiltered(category, query) {
    let tools = category === 'all' ? this.getAll() : this.getByCategory(category);
    if (query) {
      const q = query.toLowerCase().trim();
      tools = tools.filter(tool => {
        const searchable = `${tool.title} ${tool.description} ${tool.hints}`.toLowerCase();
        return searchable.includes(q);
      });
    }
    return tools;
  }

  /**
   * Get favorite tools
   */
  getFavorites(favoriteIds) {
    return favoriteIds.map(id => this.get(id)).filter(Boolean);
  }

  /**
   * Get recent tools
   */
  getRecent(recentIds) {
    return recentIds.map(id => this.get(id)).filter(Boolean);
  }
}

// Export singleton instance
export const toolRegistry = ToolRegistry.getInstance();