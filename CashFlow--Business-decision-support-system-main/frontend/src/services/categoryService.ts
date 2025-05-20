// src/services/categoryService.ts
import api from '../utils/api';
import { AxiosError } from 'axios';

export interface CategoryResponse {
  _id: string;
  business_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

// Helper function to transform backend response to frontend format
const transformCategory = (category: CategoryResponse): Category => ({
  id: category._id,
  business_id: category.business_id,
  name: category.name,
  description: category.description || undefined
});

class CategoryService {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.instance.get<CategoryResponse[]>('/api/categories');
      return response.data.map(transformCategory);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to fetch categories';
        console.error('Fetch categories error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async getCategory(categoryId: string): Promise<Category> {
    try {
      const response = await api.instance.get<CategoryResponse>(`/api/categories/${categoryId}`);
      return transformCategory(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to fetch category';
        console.error('Fetch category error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    try {
      const response = await api.instance.post<CategoryResponse>('/api/categories', data);
      return transformCategory(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to create category';
        console.error('Create category error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async updateCategory(categoryId: string, data: UpdateCategoryData): Promise<Category> {
    try {
      const response = await api.instance.put<CategoryResponse>(`/api/categories/${categoryId}`, data);
      return transformCategory(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to update category';
        console.error('Update category error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await api.instance.delete(`/api/categories/${categoryId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to delete category';
        console.error('Delete category error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;