// src/hooks/useCategories.ts
import { useState, useCallback } from 'react';
import { categoryService, Category, CreateCategoryData, UpdateCategoryData } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CreateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await categoryService.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (categoryId: string, data: UpdateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCategory = await categoryService.updateCategory(categoryId, data);
      setCategories(prev => prev.map(category => 
        category.id === categoryId ? updatedCategory : category
      ));
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(category => category.id !== categoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

export default useCategories;