'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Loader from '@/components/Loader_lupa';
import { Medicamento } from '../types';

interface SearchMedicationsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  error: string | null;
  medicamentos: Medicamento[];
  handleSearch: (e: React.FormEvent) => void;
}

const SearchMedications: React.FC<SearchMedicationsProps> = ({
  searchTerm,
  setSearchTerm,
  loading,
  error,
  medicamentos,
  handleSearch
}) => {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Buscar Medicamentos</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar medicamento..."
              className="w-full"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
            disabled={loading || !searchTerm.trim()}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchMedications;